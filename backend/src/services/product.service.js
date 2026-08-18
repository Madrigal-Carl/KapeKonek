import Product from "../models/product.model.js";
import Farm from "../models/farm.model.js";
import User from "../models/user.model.js";
import Association from "../models/association.model.js";
import Rating from "../models/rating.model.js";
import mongoose from "mongoose";

const getFullName = (user) =>
    [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

// Kaluppa can sell everything except coffee cherries; farmers and managers
// always register coffee cherries.
const KALUPPA_CATEGORIES = [
    "fertilizer",
    "coffee_beans",
    "coffee_seedlings",
];

const resolveCategory = (category, authenticatedUser) => {
    if (authenticatedUser.role === "kaluppa") {
        if (!KALUPPA_CATEGORIES.includes(category)) {
            const badRequestError = new Error(
                "Kaluppa can only register fertilizer, coffee beans, or coffee seedlings",
            );
            badRequestError.statusCode = 400;
            throw badRequestError;
        }

        return category;
    }

    // Farmers and managers always register coffee cherries.
    return "coffee_cherries";
};

const escapeRegex = (str) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getProducts = async (
    { all, page, limit, status, category, search },
    authenticatedUser,
) => {
    const filter = { deletedAt: null };

    if (status) {
        filter.status = status;
    }

    if (category) {
        filter.category = category;
    }

    if (search) {
        // Products are identified by category/variety (no product name).
        filter.$or = [
            { category: new RegExp(escapeRegex(search), "i") },
            { variety: new RegExp(escapeRegex(search), "i") },
            { description: new RegExp(escapeRegex(search), "i") },
        ];
    }

    if (authenticatedUser.role === "farmer") {
        // Farmers only see products registered to them.
        filter.owner = authenticatedUser._id;
    } else if (authenticatedUser.role === "kaluppa") {
        // Kaluppa only sees their own products.
        filter.owner = authenticatedUser._id;
    } else if (authenticatedUser.role === "manager") {
        // Managers see the products of all farmers in their association.
        const association = await Association.findOne({
            user: authenticatedUser._id,
        }).select("assignedFarmers");

        const farmerIds = (association?.assignedFarmers ?? []).map((id) =>
            id.toString(),
        );

        if (!farmerIds.length) {
            return all
                ? { products: [], pagination: null }
                : {
                      products: [],
                      pagination: { page, limit, total: 0, totalPages: 1 },
                  };
        }

        filter.owner = { $in: farmerIds };
    }
    // DTI sees all products.

    if (all) {
        const products = await Product.find(filter).sort({ createdAt: -1 });

        return {
            products: await attachProductData(products),
            pagination: null,
        };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
        Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Product.countDocuments(filter),
    ]);

    return {
        products: await attachProductData(products),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
};

export const createProduct = async (data, authenticatedUser) => {
    let owner;

    if (authenticatedUser.role === "manager") {
        if (!data.owner) {
            const badRequestError = new Error("Owner is required");
            badRequestError.statusCode = 400;
            throw badRequestError;
        }

        const managerAssociation = await Association.findOne({
            user: authenticatedUser._id,
        }).select("assignedFarmers");

        const farmerDoc = await User.findOne({
            _id: data.owner,
            role: "farmer",
            deletedAt: null,
        });

        if (!farmerDoc) {
            const notFoundError = new Error("Farmer not found");
            notFoundError.statusCode = 404;
            throw notFoundError;
        }

        if (
            !managerAssociation?.assignedFarmers.some((farmerId) =>
                farmerId.equals(data.owner),
            )
        ) {
            const badRequestError = new Error(
                "Farmer must belong to your association",
            );
            badRequestError.statusCode = 400;
            throw badRequestError;
        }

        owner = data.owner;
    } else {
        // Farmers and kaluppa own what they register.
        owner = authenticatedUser._id;
    }

    const { owner: _ignoredOwner, ...rest } = data;

    const product = await Product.create({
        ...rest,
        category: resolveCategory(rest.category, authenticatedUser),
        // Farmers and managers manage by weight, kaluppa by stock — stock
        // stays null when the creator doesn't track it.
        stock: rest.stock ?? null,
        owner,
    });

    return attachProductData([product]).then(([attached]) => attached);
};

export const updateProduct = async (id, data, authenticatedUser) => {
    const product = await Product.findOne({ _id: id, deletedAt: null });

    if (!product) {
        const notFoundError = new Error("Product not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    await assertCanModifyProduct(product, authenticatedUser);

    const updated = await Product.findOneAndUpdate(
        { _id: product._id, deletedAt: null },
        { $set: data },
        { returnDocument: "after", runValidators: true },
    );

    return attachProductData([updated]).then(([attached]) => attached);
};

export const deleteProduct = async (id, authenticatedUser) => {
    const product = await Product.findOne({ _id: id, deletedAt: null });

    if (!product) {
        const notFoundError = new Error("Product not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    await assertCanModifyProduct(product, authenticatedUser);

    const deleted = await Product.findOneAndUpdate(
        { _id: product._id, deletedAt: null },
        { $set: { deletedAt: new Date() } },
        { returnDocument: "after" },
    );

    return { _id: deleted._id, deletedAt: deleted.deletedAt };
};

const assertCanModifyProduct = async (product, authenticatedUser) => {
    if (authenticatedUser.role === "farmer" || authenticatedUser.role === "kaluppa") {
        if (product.owner.equals(authenticatedUser._id)) return;

        const forbiddenError = new Error("Forbidden: insufficient permissions");
        forbiddenError.statusCode = 403;
        throw forbiddenError;
    }

    if (authenticatedUser.role === "manager") {
        const association = await Association.findOne({
            user: authenticatedUser._id,
        }).select("assignedFarmers");

        if (
            association?.assignedFarmers.some((farmerId) =>
                farmerId.equals(product.owner),
            )
        ) {
            return;
        }
    }

    const forbiddenError = new Error("Forbidden: insufficient permissions");
    forbiddenError.statusCode = 403;
    throw forbiddenError;
};

const attachProductData = async (products) => {
    if (!products.length) return [];

    const ownerIds = [
        ...new Set(
            products.map((product) => product.owner?.toString()).filter(Boolean),
        ),
    ];
    const farmIds = [
        ...new Set(
            products.map((product) => product.farm?.toString()).filter(Boolean),
        ),
    ];

    const [owners, farms, ratingAgg] = await Promise.all([
        ownerIds.length
            ? User.find({ _id: { $in: ownerIds } }).select(
                  "firstName middleName lastName",
              )
            : [],
        farmIds.length
            ? Farm.find({ _id: { $in: farmIds } }).select(
                  "propertyNumber address",
              )
            : [],
        farmIds.length
            ? Rating.aggregate([
                  {
                      $match: {
                          farm: {
                              $in: farmIds.map(
                                  (id) => new mongoose.Types.ObjectId(id),
                              ),
                          },
                      },
                  },
                  {
                      $group: {
                          _id: {
                              farm: "$farm",
                              category: "$category",
                              variety: "$variety",
                          },
                          avg: { $avg: "$rating" },
                          count: { $sum: 1 },
                      },
                  },
              ])
            : [],
    ]);

    const nameByUser = new Map(
        owners.map((user) => [user._id.toString(), getFullName(user)]),
    );
    const farmMap = new Map(
        farms.map((farm) => [farm._id.toString(), farm]),
    );
    const ratingByKey = new Map(
        ratingAgg.map((entry) => {
            const key = `${entry._id.farm.toString()}|${entry._id.category}|${entry._id.variety}`;
            return [key, entry];
        }),
    );

    return products.map((product) => {
        const obj = product.toObject();
        const ownerId = obj.owner?.toString();
        const farmId = obj.farm?.toString();
        const farm = farmMap.get(farmId);
        const ratingEntry = ratingByKey.get(
            `${farmId}|${obj.category}|${obj.variety}`,
        );

        return {
            ...obj,
            owner: ownerId
                ? { _id: ownerId, fullName: nameByUser.get(ownerId) ?? ownerId }
                : null,
            farm: farm
                ? {
                      _id: farm._id,
                      propertyNumber: farm.propertyNumber,
                      address: farm.address,
                  }
                : null,
            rating: ratingEntry
                ? Number(ratingEntry.avg.toFixed(1))
                : null,
            ratingCount: ratingEntry?.count ?? 0,
        };
    });
};
