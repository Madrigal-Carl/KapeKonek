import CoffeeBean from "../models/coffeeBean.model.js";
import User from "../models/user.model.js";
import Association from "../models/association.model.js";

const getFullName = (user) =>
    [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

const escapeRegex = (str) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getCoffeeBeans = async (
    { all, page, limit, status, variety, search },
    authenticatedUser,
) => {
    const filter = { deletedAt: null };

    if (status) {
        filter.status = status;
    }

    if (variety) {
        filter.variety = variety;
    }

    if (authenticatedUser.role === "farmer") {
        filter.owner = authenticatedUser._id;
    } else if (authenticatedUser.role === "manager") {
        const association = await Association.findOne({
            user: authenticatedUser._id,
        }).select("assignedFarmers");

        const farmerIds = (association?.assignedFarmers ?? []).map((id) =>
            id.toString(),
        );

        if (!farmerIds.length) {
            return all
                ? { coffeeBeans: [], pagination: null }
                : {
                      coffeeBeans: [],
                      pagination: { page, limit, total: 0, totalPages: 1 },
                  };
        }

        filter.owner = { $in: farmerIds };
    } else if (authenticatedUser.role === "kaluppa") {
        // Kaluppa only sees coffee beans whose price has been set by DTI.
        filter.price = { $ne: null };
    }
    // DTI sees all beans (priced and unpriced) to set prices.

    if (search) {
        const matchingOwners = await User.find({
            $or: [
                { firstName: new RegExp(escapeRegex(search), "i") },
                { middleName: new RegExp(escapeRegex(search), "i") },
                { lastName: new RegExp(escapeRegex(search), "i") },
            ],
            deletedAt: null,
        }).distinct("_id");

        const searchClauses = [
            { variety: new RegExp(escapeRegex(search), "i") },
            { description: new RegExp(escapeRegex(search), "i") },
        ];

        if (matchingOwners.length) {
            searchClauses.push({ owner: { $in: matchingOwners } });
        }

        filter.$and = filter.$and || [];
        filter.$and.push({ $or: searchClauses });
    }

    if (all) {
        const coffeeBeans = await CoffeeBean.find(filter).sort({ createdAt: -1 });

        return {
            coffeeBeans: await attachCoffeeBeanData(coffeeBeans),
            pagination: null,
        };
    }

    const skip = (page - 1) * limit;

    const [coffeeBeans, total] = await Promise.all([
        CoffeeBean.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        CoffeeBean.countDocuments(filter),
    ]);

    return {
        coffeeBeans: await attachCoffeeBeanData(coffeeBeans),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
};

export const getCoffeeBeanById = async (id, viewer) => {
    const filter = { _id: id, deletedAt: null };

    if (viewer?.role === "kaluppa") {
        filter.price = { $ne: null };
    }

    const coffeeBean = await CoffeeBean.findOne(filter);

    if (!coffeeBean) {
        const notFoundError = new Error("Coffee bean not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    const [attached] = await attachCoffeeBeanData([coffeeBean]);
    return attached;
};

export const createCoffeeBean = async (data, authenticatedUser) => {
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
        owner = authenticatedUser._id;
    }

    const { owner: _ignoredOwner, price: _ignoredPrice, ...rest } = data;

    const coffeeBean = await CoffeeBean.create({
        ...rest,
        price: null,
        owner,
    });

    return attachCoffeeBeanData([coffeeBean]).then(([attached]) => attached);
};

export const updateCoffeeBean = async (id, data, authenticatedUser) => {
    const coffeeBean = await CoffeeBean.findOne({ _id: id, deletedAt: null });

    if (!coffeeBean) {
        const notFoundError = new Error("Coffee bean not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    await assertCanModifyCoffeeBean(coffeeBean, authenticatedUser);

    const { owner: _ignoredOwner, price: _ignoredPrice, ...rest } = data;

    const updated = await CoffeeBean.findOneAndUpdate(
        { _id: coffeeBean._id, deletedAt: null },
        { $set: rest },
        { returnDocument: "after", runValidators: true },
    );

    return attachCoffeeBeanData([updated]).then(([attached]) => attached);
};

export const updateCoffeeBeanPrice = async (id, price, authenticatedUser) => {
    if (authenticatedUser.role !== "dti") {
        const forbiddenError = new Error(
            "Forbidden: insufficient permissions",
        );
        forbiddenError.statusCode = 403;
        throw forbiddenError;
    }

    const coffeeBean = await CoffeeBean.findOne({ _id: id, deletedAt: null });

    if (!coffeeBean) {
        const notFoundError = new Error("Coffee bean not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    const updated = await CoffeeBean.findOneAndUpdate(
        { _id: coffeeBean._id, deletedAt: null },
        { $set: { price } },
        { returnDocument: "after", runValidators: true },
    );

    return attachCoffeeBeanData([updated]).then(([attached]) => attached);
};

export const deleteCoffeeBean = async (id, authenticatedUser) => {
    const coffeeBean = await CoffeeBean.findOne({ _id: id, deletedAt: null });

    if (!coffeeBean) {
        const notFoundError = new Error("Coffee bean not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    await assertCanModifyCoffeeBean(coffeeBean, authenticatedUser);

    const deleted = await CoffeeBean.findOneAndUpdate(
        { _id: coffeeBean._id, deletedAt: null },
        { $set: { deletedAt: new Date() } },
        { returnDocument: "after" },
    );

    return { _id: deleted._id, deletedAt: deleted.deletedAt };
};

const assertCanModifyCoffeeBean = async (coffeeBean, authenticatedUser) => {
    if (authenticatedUser.role === "farmer") {
        if (coffeeBean.owner.equals(authenticatedUser._id)) return;

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
                farmerId.equals(coffeeBean.owner),
            )
        ) {
            return;
        }
    }

    const forbiddenError = new Error("Forbidden: insufficient permissions");
    forbiddenError.statusCode = 403;
    throw forbiddenError;
};

const attachCoffeeBeanData = async (coffeeBeans) => {
    if (!coffeeBeans.length) return [];

    const ownerIds = [
        ...new Set(
            coffeeBeans
                .map((bean) => bean.owner?.toString())
                .filter(Boolean),
        ),
    ];

    const owners = ownerIds.length
        ? await User.find({ _id: { $in: ownerIds } }).select(
              "firstName middleName lastName role",
          )
        : [];

    const nameByUser = new Map(
        owners.map((user) => [user._id.toString(), getFullName(user)]),
    );

    return coffeeBeans.map((bean) => {
        const obj = bean.toObject();
        const ownerId = obj.owner?.toString();

        return {
            ...obj,
            owner: ownerId
                ? {
                      _id: ownerId,
                      fullName: nameByUser.get(ownerId) ?? ownerId,
                      role:
                          owners.find((o) => o._id.toString() === ownerId)
                              ?.role ?? null,
                  }
                : null,
        };
    });
};
