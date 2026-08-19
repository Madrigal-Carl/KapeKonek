import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Rating from "../models/rating.model.js";
import Order from "../models/order.model.js";

const getFullName = (user) =>
    [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

const escapeRegex = (str) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getProducts = async (
    { all, page, limit, status, category, variety, search },
    authenticatedUser,
) => {
    const filter = { deletedAt: null, owner: authenticatedUser._id };

    if (status) {
        filter.status = status;
    }

    if (category) {
        filter.category = category;
    }

    if (variety) {
        filter.variety = variety;
    }

    if (search) {
        filter.$or = [
            { category: new RegExp(escapeRegex(search), "i") },
            { variety: new RegExp(escapeRegex(search), "i") },
            { description: new RegExp(escapeRegex(search), "i") },
        ];
    }

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

export const getCatalogProducts = async (
    { all, page, limit, category, variety, search },
    viewer,
) => {
    const kaluppaUsers = await User.find({
        role: "kaluppa",
        deletedAt: null,
    }).distinct("_id");

    const filter = {
        deletedAt: null,
        status: "active",
        owner: { $in: kaluppaUsers },
        price: { $ne: null },
    };

    if (category) {
        filter.category = category;
    }

    if (variety) {
        filter.variety = variety;
    }

    if (search) {
        filter.$or = [
            { category: new RegExp(escapeRegex(search), "i") },
            { variety: new RegExp(escapeRegex(search), "i") },
            { description: new RegExp(escapeRegex(search), "i") },
        ];
    }

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

export const getProductById = async (id, viewer) => {
    const product = await Product.findOne({ _id: id, deletedAt: null });

    if (!product) {
        const notFoundError = new Error("Product not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    const [attached] = await attachProductData([product]);

    const [soldAgg] = await Order.aggregate([
        { $match: { "orderedProducts.product": product._id } },
        { $unwind: "$orderedProducts" },
        { $match: { "orderedProducts.product": product._id } },
        { $group: { _id: null, sold: { $sum: "$orderedProducts.quantity" } } },
    ]);

    return { ...attached, soldCount: soldAgg?.sold ?? 0 };
};

const findProductForReviews = async (id) => {
    const product = await Product.findOne({ _id: id, deletedAt: null });

    if (!product) {
        const notFoundError = new Error("Product not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    return product;
};

const attachReviewAuthor = (review) => ({
    _id: review._id,
    author: review.author
        ? {
              _id: review.author._id,
              fullName: getFullName(review.author),
          }
        : null,
    rating: review.rating,
    message: review.message ?? "",
    createdAt: review.createdAt,
});

export const getProductReviews = async (id) => {
    const product = await findProductForReviews(id);

    const reviews = await Rating.find({
        category: product.category,
        variety: product.variety,
    })
        .populate("author", "firstName middleName lastName")
        .sort({ createdAt: -1 });

    return reviews.map(attachReviewAuthor);
};

export const createProductReview = async (id, data, authenticatedUser) => {
    const product = await findProductForReviews(id);

    const review = await Rating.findOneAndUpdate(
        {
            author: authenticatedUser._id,
            category: product.category,
            variety: product.variety,
        },
        {
            $set: {
                product: product._id,
                category: product.category,
                variety: product.variety,
                rating: data.rating,
                message: data.message ?? "",
            },
        },
        { upsert: true, returnDocument: "after" },
    );

    const full = await Rating.findById(review._id).populate(
        "author",
        "firstName middleName lastName",
    );

    return attachReviewAuthor(full);
};

export const createProduct = async (data, authenticatedUser) => {
    if (authenticatedUser.role !== "kaluppa") {
        const forbiddenError = new Error("Forbidden: only Kaluppa can manage products");
        forbiddenError.statusCode = 403;
        throw forbiddenError;
    }

    const { owner: _ignoredOwner, ...rest } = data;

    const product = await Product.create({
        ...rest,
        category: rest.category,
        variety: rest.variety,
        stock: rest.stock ?? null,
        price: rest.price,
        owner: authenticatedUser._id,
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

    if (authenticatedUser.role !== "kaluppa" || !product.owner.equals(authenticatedUser._id)) {
        const forbiddenError = new Error("Forbidden: insufficient permissions");
        forbiddenError.statusCode = 403;
        throw forbiddenError;
    }

    const updated = await Product.findOneAndUpdate(
        { _id: product._id, deletedAt: null },
        { $set: data },
        { returnDocument: "after", runValidators: true },
    );

    return attachProductData([updated]).then(([attached]) => attached);
};

export const updateProductPrice = async (id, price, authenticatedUser) => {
    const product = await Product.findOne({ _id: id, deletedAt: null });

    if (!product) {
        const notFoundError = new Error("Product not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    if (authenticatedUser.role !== "kaluppa" || !product.owner.equals(authenticatedUser._id)) {
        const forbiddenError = new Error("Forbidden: insufficient permissions");
        forbiddenError.statusCode = 403;
        throw forbiddenError;
    }

    const updated = await Product.findOneAndUpdate(
        { _id: product._id, deletedAt: null },
        { $set: { price } },
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

    if (authenticatedUser.role !== "kaluppa" || !product.owner.equals(authenticatedUser._id)) {
        const forbiddenError = new Error("Forbidden: insufficient permissions");
        forbiddenError.statusCode = 403;
        throw forbiddenError;
    }

    const deleted = await Product.findOneAndUpdate(
        { _id: product._id, deletedAt: null },
        { $set: { deletedAt: new Date() } },
        { returnDocument: "after" },
    );

    return { _id: deleted._id, deletedAt: deleted.deletedAt };
};

const attachProductData = async (products) => {
    if (!products.length) return [];

    const ownerIds = [
        ...new Set(
            products.map((product) => product.owner?.toString()).filter(Boolean),
        ),
    ];
    const categoryVarietyPairs = [
        ...new Set(
            products
                .filter((p) => p.category && p.variety)
                .map((p) => `${p.category}|${p.variety}`),
        ),
    ];

    const [owners, ratingAgg] = await Promise.all([
        ownerIds.length
            ? User.find({ _id: { $in: ownerIds } }).select(
                  "firstName middleName lastName role",
              )
            : [],
        categoryVarietyPairs.length
            ? Rating.aggregate([
                  {
                      $match: {
                          $or: categoryVarietyPairs.map((pair) => {
                              const [cat, varr] = pair.split("|");
                              return { category: cat, variety: varr };
                          }),
                      },
                  },
                  {
                      $group: {
                          _id: {
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
    const ratingByKey = new Map(
        ratingAgg.map((entry) => [
            `${entry._id.category}|${entry._id.variety}`,
            entry,
        ]),
    );

    return products.map((product) => {
        const obj = product.toObject();
        const ownerId = obj.owner?.toString();
        const ratingEntry = ratingByKey.get(`${obj.category}|${obj.variety}`);

        return {
            ...obj,
            owner: ownerId
                ? {
                      _id: ownerId,
                      fullName: nameByUser.get(ownerId) ?? ownerId,
                      role: owners.find((o) => o._id.toString() === ownerId)
                          ?.role ?? null,
                  }
                : null,
            rating: ratingEntry
                ? Number(ratingEntry.avg.toFixed(1))
                : null,
            ratingCount: ratingEntry?.count ?? 0,
        };
    });
};
