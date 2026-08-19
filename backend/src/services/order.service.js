import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import emailQueue from "../queues/email.queue.js";
import { EMAIL_JOBS } from "../queues/email.jobs.js";

const getFullName = (user) =>
    [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

const escapeRegex = (str) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const generateReferenceNumber = () => {
    const stamp = Date.now().toString(36).toUpperCase().slice(-6);
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `KK-${stamp}${rand}`;
};

const CANCELLATION_WINDOW_MS = 60 * 60 * 1000; // 1 hour

const attachOrderData = (order) => {
    const doc = order.toObject ? order.toObject() : order;
    doc.id = doc._id;

    if (doc.customer && typeof doc.customer === "object") {
        doc.customer = {
            _id: doc.customer._id,
            fullName: getFullName(doc.customer),
            email: doc.customer.email,
            contactNumber: doc.customer.contactNumber || doc.customer.phoneNumber,
            address: doc.customer.address,
            role: doc.customer.role,
        };
    }

    return doc;
};

export const getOrders = async (
    { all, page, limit, status, search },
    authenticatedUser,
) => {
    const filter = {};

    if (authenticatedUser.role !== "kaluppa") {
        filter.customer = authenticatedUser._id;
    }

    if (status) {
        filter.status = status;
    }

    if (search) {
        const regex = new RegExp(escapeRegex(search), "i");
        filter.$or = [
            { referenceNumber: regex },
            { "orderedProducts.name": regex },
        ];
    }

    const query = Order.find(filter)
        .populate("customer", "firstName middleName lastName email contactNumber address role")
        .sort({ createdAt: -1 });

    if (all) {
        const orders = await query;
        return {
            orders: orders.map(attachOrderData),
            pagination: null,
        };
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
        query.skip(skip).limit(limit),
        Order.countDocuments(filter),
    ]);

    return {
        orders: orders.map(attachOrderData),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
};

export const getOrderById = async (id, authenticatedUser) => {
    const order = await Order.findById(id).populate(
        "customer",
        "firstName middleName lastName email contactNumber address role",
    );

    if (!order) {
        const notFoundError = new Error("Order not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    if (
        authenticatedUser.role !== "kaluppa" &&
        !order.customer._id.equals(authenticatedUser._id)
    ) {
        const forbiddenError = new Error("Forbidden: insufficient permissions");
        forbiddenError.statusCode = 403;
        throw forbiddenError;
    }

    return attachOrderData(order);
};

export const createOrder = async (data, authenticatedUser) => {
    const { paymentMethod, deliveryMethod, items = [], receipts = [] } = data;

    if (!items.length) {
        const badRequestError = new Error(
            "Order must contain at least one item",
        );
        badRequestError.statusCode = 400;
        throw badRequestError;
    }

    if (paymentMethod === "e-wallet" && receipts.length === 0) {
        const badRequestError = new Error(
            "A payment receipt is required for e-wallet payments",
        );
        badRequestError.statusCode = 400;
        throw badRequestError;
    }

    const productIds = [...new Set(items.map((item) => item.product))];
    const products = await Product.find({
        _id: { $in: productIds },
        deletedAt: null,
    });

    const productById = new Map(products.map((p) => [p._id.toString(), p]));

    const orderedProducts = [];
    let total = 0;

    for (const item of items) {
        const product = productById.get(item.product.toString());

        if (!product || product.price == null) {
            const badRequestError = new Error(
                "One or more products are no longer available",
            );
            badRequestError.statusCode = 400;
            throw badRequestError;
        }

        const quantity = Number(item.quantity);
        const available = product.stock;

        if (quantity <= 0 || (available != null && quantity > available)) {
            const badRequestError = new Error(
                `Only ${available ?? 0} stock available for ${product.variety || product.category}`,
            );
            badRequestError.statusCode = 400;
            throw badRequestError;
        }

        const lineTotal = Math.round(product.price * quantity * 100) / 100;
        total += lineTotal;

        const displayName = product.variety
            ? `${product.variety.charAt(0).toUpperCase() + product.variety.slice(1)} (${product.category.replace(/_/g, " ")})`
            : product.category.replace(/_/g, " ");

        orderedProducts.push({
            product: product._id,
            name: displayName,
            price: product.price,
            quantity,
        });
    }

    total = Math.round(total * 100) / 100;

    let referenceNumber = generateReferenceNumber();
    while (await Order.exists({ referenceNumber })) {
        referenceNumber = generateReferenceNumber();
    }

    const order = await Order.create({
        customer: authenticatedUser._id,
        referenceNumber,
        paymentMethod,
        deliveryMethod,
        totalPrice: total,
        deliveryFee: null,
        status: "pending",
        orderedProducts,
        receipts,
    });

    await queueOrderEmail(EMAIL_JOBS.ORDER_CONFIRMATION, order, authenticatedUser);

    const populated = await Order.findById(order._id).populate(
        "customer",
        "firstName middleName lastName email contactNumber address role",
    );

    return attachOrderData(populated);
};

export const updateOrderStatus = async (
    id,
    { status: newStatus, deliveryFee, remarks },
    authenticatedUser,
) => {
    if (authenticatedUser.role !== "kaluppa") {
        const forbiddenError = new Error("Forbidden: only Kaluppa can update order status");
        forbiddenError.statusCode = 403;
        throw forbiddenError;
    }

    const order = await Order.findById(id).populate(
        "customer",
        "firstName middleName lastName email contactNumber address role",
    );

    if (!order) {
        const notFoundError = new Error("Order not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    const prevStatus = order.status;

    if (newStatus === "reserved") {
        if (order.deliveryMethod === "delivery" && deliveryFee != null) {
            order.deliveryFee = Number(deliveryFee);
        }

        // Deduct stock if transitioning into reserved for the first time
        if (prevStatus !== "reserved") {
            for (const item of order.orderedProducts) {
                const product = await Product.findById(item.product);
                if (product) {
                    const currentStock =
                        typeof product.stock === "number" ? product.stock : 0;
                    product.stock = Math.max(0, currentStock - item.quantity);
                    await product.save();
                }
            }
        }

        order.status = "reserved";
        await order.save();
        await queueOrderEmail(EMAIL_JOBS.ORDER_RESERVED, order, order.customer);
    } else if (newStatus === "completed") {
        if (prevStatus !== "reserved") {
            const badRequestError = new Error(
                "Orders can only be marked as completed if they are in reserved status",
            );
            badRequestError.statusCode = 400;
            throw badRequestError;
        }

        order.status = "completed";
        await order.save();
        await queueOrderEmail(EMAIL_JOBS.ORDER_COMPLETED, order, order.customer);
    } else if (newStatus === "cancelled") {
        if (prevStatus !== "pending") {
            const badRequestError = new Error(
                "Only pending orders can be cancelled",
            );
            badRequestError.statusCode = 400;
            throw badRequestError;
        }

        order.status = "cancelled";
        if (remarks?.trim()) {
            order.remarks = remarks.trim();
        }
        await order.save();

        await queueOrderEmail(EMAIL_JOBS.ORDER_CANCELLED, order, order.customer, {
            remarks: order.remarks,
            cancelledByRole: "kaluppa",
        });
    }

    return attachOrderData(order);
};

export const reserveOrder = async (id, { deliveryFee }, authenticatedUser) => {
    return updateOrderStatus(
        id,
        { status: "reserved", deliveryFee },
        authenticatedUser,
    );
};

export const completeOrder = async (id, authenticatedUser) => {
    return updateOrderStatus(
        id,
        { status: "completed" },
        authenticatedUser,
    );
};

export const cancelOrder = async (id, { remarks } = {}, authenticatedUser) => {
    const order = await Order.findById(id).populate(
        "customer",
        "firstName middleName lastName email contactNumber address role",
    );

    if (!order) {
        const notFoundError = new Error("Order not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    if (order.status !== "pending") {
        const badRequestError = new Error(
            "Only pending orders can be cancelled",
        );
        badRequestError.statusCode = 400;
        throw badRequestError;
    }

    const isKaluppa = authenticatedUser.role === "kaluppa";
    const isCustomer = order.customer._id.equals(authenticatedUser._id);

    if (!isKaluppa && !isCustomer) {
        const forbiddenError = new Error("Forbidden: insufficient permissions");
        forbiddenError.statusCode = 403;
        throw forbiddenError;
    }

    // Strict Buyer & Farmer Customer 1-hour cancellation check
    if (isCustomer && !isKaluppa) {
        if (Date.now() - order.createdAt.getTime() > CANCELLATION_WINDOW_MS) {
            const badRequestError = new Error(
                "Orders can only be cancelled by the customer within 1 hour of placing",
            );
            badRequestError.statusCode = 400;
            throw badRequestError;
        }
    }

    order.status = "cancelled";
    if (remarks?.trim()) {
        order.remarks = remarks.trim();
    }
    await order.save();

    if (isKaluppa) {
        await queueOrderEmail(EMAIL_JOBS.ORDER_CANCELLED, order, order.customer, {
            remarks: order.remarks,
            cancelledByRole: "kaluppa",
        });
    }

    return attachOrderData(order);
};

const queueOrderEmail = async (jobType, order, customerUser, extraData = {}) => {
    try {
        const user =
            customerUser.email
                ? customerUser
                : await User.findById(customerUser._id).select(
                      "firstName middleName lastName email",
                  );

        if (!user?.email) return;

        await emailQueue.add(jobType, {
            type: jobType,
            data: {
                to: user.email,
                name: getFullName(user),
                referenceNumber: order.referenceNumber,
                deliveryMethod: order.deliveryMethod,
                deliveryFee: order.deliveryFee,
                totalPrice: order.totalPrice,
                items: (order.orderedProducts ?? []).map((item) => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    lineTotal: Math.round(item.price * item.quantity * 100) / 100,
                })),
                ...extraData,
            },
        });

        console.log(`Email job [${jobType}] queued for ${user.email}`);
    } catch (error) {
        console.error(`Failed to queue email job [${jobType}]:`, error);
    }
};
