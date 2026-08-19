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

const generateReferenceNumber = () => {
    const stamp = Date.now().toString(36).toUpperCase().slice(-6);
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `KK-${stamp}${rand}`;
};

// Returns a plain JSON-safe order (computed server-side, so prices and
// availability can't be tampered with by the client).
const attachOrderData = (order) => {
    const doc = order.toObject();
    doc.id = doc._id;
    return doc;
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
        // Stock items buy by count, weight items buy by kg.
        const available =
            product.stock != null ? product.stock : product.weight;

        if (quantity <= 0 || (available != null && quantity > available)) {
            const badRequestError = new Error(
                `Only ${available} ${product.stock != null ? "stock" : "kg"} are available for this product`,
            );
            badRequestError.statusCode = 400;
            throw badRequestError;
        }

        const lineTotal = Math.round(product.price * quantity * 100) / 100;
        total += lineTotal;

        orderedProducts.push({
            product: product._id,
            name: product.variety,
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

    await queueOrderConfirmationEmail(
        authenticatedUser,
        referenceNumber,
        orderedProducts,
        total,
        deliveryMethod,
    );

    return attachOrderData(order);
};

// Fire-and-forget the confirmation email — a mailer outage must never block
// order placement.
const queueOrderConfirmationEmail = async (
    customer,
    referenceNumber,
    orderedProducts,
    total,
    deliveryMethod,
) => {
    try {
        const user = await User.findById(customer._id).select(
            "firstName middleName lastName email",
        );

        if (!user?.email) return;

        await emailQueue.add("email:order-confirmation", {
            type: EMAIL_JOBS.ORDER_CONFIRMATION,
            data: {
                to: user.email,
                name: getFullName(user),
                referenceNumber,
                deliveryMethod,
                totalPrice: total,
                items: orderedProducts.map((item) => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    lineTotal: Math.round(item.price * item.quantity * 100) / 100,
                })),
            },
        });

        console.log(`Order confirmation email queued for ${user.email}`);
    } catch (error) {
        console.error("Failed to queue order confirmation email:", error);
    }
};

export const getMyOrders = async (authenticatedUser) => {
    const orders = await Order.find({ customer: authenticatedUser._id }).sort({
        createdAt: -1,
    });

    return orders.map(attachOrderData);
};

const CANCELLATION_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export const cancelOrder = async (id, authenticatedUser) => {
    const order = await Order.findOne({
        _id: id,
        customer: authenticatedUser._id,
    });

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

    if (Date.now() - order.createdAt.getTime() > CANCELLATION_WINDOW_MS) {
        const badRequestError = new Error(
            "Orders can only be cancelled within 1 hour of placing",
        );
        badRequestError.statusCode = 400;
        throw badRequestError;
    }

    order.status = "cancelled";
    await order.save();

    return attachOrderData(order);
};
