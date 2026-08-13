import Harvest from "../models/harvest.model.js";
import Farm from "../models/farm.model.js";
import User from "../models/user.model.js";
import Association from "../models/association.model.js";
import FarmerVerification from "../models/farmerVerification.model.js";

const getFullName = (user) =>
    [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

export const getHarvests = async (
    { all, page, limit, variety },
    authenticatedUser,
) => {
    const filter = { deletedAt: null };

    if (variety?.length) {
        filter.variety = { $in: variety };
    }

    if (authenticatedUser.role === "farmer") {
        filter.farmer = authenticatedUser._id;
    } else if (authenticatedUser.role === "manager") {
        // Managers see their own association's harvests — or everything
        // when they don't belong to an association yet.
        const association = await Association.findOne({
            user: authenticatedUser._id,
        }).select("_id");

        if (association) {
            filter.association = association._id;
        }
    }

    if (all) {
        const harvests = await Harvest.find(filter).sort({ harvestedAt: -1 });

        return {
            harvests: await attachHarvestData(harvests),
            pagination: null,
        };
    }

    const skip = (page - 1) * limit;

    const [harvests, total] = await Promise.all([
        Harvest.find(filter).sort({ harvestedAt: -1 }).skip(skip).limit(limit),
        Harvest.countDocuments(filter),
    ]);

    return {
        harvests: await attachHarvestData(harvests),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
};

export const createHarvest = async (data, authenticatedUser) => {
    const farm = await Farm.findOne({ _id: data.farm, deletedAt: null });

    if (!farm) {
        const notFoundError = new Error("Farm not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    let farmer;
    let association;

    if (authenticatedUser.role === "farmer") {
        // Farmer: the farmer and their association are resolved from the
        // authenticated account.
        const verification = await FarmerVerification.findOne({
            user: authenticatedUser._id,
        }).select("association");

        if (!verification?.association) {
            const forbiddenError = new Error(
                "You must belong to an association to record a harvest",
            );
            forbiddenError.statusCode = 403;
            throw forbiddenError;
        }

        if (
            !farm.association ||
            !farm.association.equals(verification.association)
        ) {
            const forbiddenError = new Error(
                "You can only record harvests on farms in your own association",
            );
            forbiddenError.statusCode = 403;
            throw forbiddenError;
        }

        farmer = authenticatedUser._id;
        association = verification.association;
    } else {
        // Manager + kaluppa: a farmer must be provided.
        if (!data.farmer) {
            const badRequestError = new Error("Farmer is required");
            badRequestError.statusCode = 400;
            throw badRequestError;
        }

        const farmerDoc = await User.findOne({
            _id: data.farmer,
            role: "farmer",
            deletedAt: null,
        });

        if (!farmerDoc) {
            const notFoundError = new Error("Farmer not found");
            notFoundError.statusCode = 404;
            throw notFoundError;
        }

        if (authenticatedUser.role === "manager") {
            // Manager: association comes from the manager's own account and
            // the farmer must belong to that association.
            const managerAssociation = await Association.findOne({
                user: authenticatedUser._id,
            }).select("_id assignedFarmers");

            if (!managerAssociation) {
                const forbiddenError = new Error(
                    "You must have an association to record a harvest",
                );
                forbiddenError.statusCode = 403;
                throw forbiddenError;
            }

            if (
                !managerAssociation.assignedFarmers.some((farmerId) =>
                    farmerId.equals(data.farmer),
                )
            ) {
                const badRequestError = new Error(
                    "Farmer must be assigned to your association",
                );
                badRequestError.statusCode = 400;
                throw badRequestError;
            }

            farmer = data.farmer;
            association = managerAssociation._id;
        } else {
            // Kaluppa: the association comes from the farm itself.
            farmer = data.farmer;
            association = farm.association;
        }
    }

    const { farmer: _ignoredFarmer, ...rest } = data;

    const harvest = await Harvest.create({
        ...rest,
        farmer,
        association,
    });

    return attachHarvestData([harvest]).then(([attached]) => attached);
};

export const updateHarvest = async (id, data, authenticatedUser) => {
    const harvest = await Harvest.findOne({ _id: id, deletedAt: null });

    if (!harvest) {
        const notFoundError = new Error("Harvest not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    await assertCanModifyHarvest(harvest, authenticatedUser);

    const updated = await Harvest.findOneAndUpdate(
        { _id: harvest._id, deletedAt: null },
        { $set: data },
        { returnDocument: "after", runValidators: true },
    );

    return attachHarvestData([updated]).then(([attached]) => attached);
};

export const deleteHarvest = async (id, authenticatedUser) => {
    const harvest = await Harvest.findOne({ _id: id, deletedAt: null });

    if (!harvest) {
        const notFoundError = new Error("Harvest not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    await assertCanModifyHarvest(harvest, authenticatedUser);

    const deleted = await Harvest.findOneAndUpdate(
        { _id: harvest._id, deletedAt: null },
        { $set: { deletedAt: new Date() } },
        { returnDocument: "after" },
    );

    return attachHarvestData([deleted]).then(([attached]) => attached);
};

const assertCanModifyHarvest = async (harvest, authenticatedUser) => {
    // Kaluppa can modify any harvest.
    if (authenticatedUser.role === "kaluppa") return;

    // Managers can only modify harvests inside their own association.
    if (authenticatedUser.role === "manager") {
        const association = await Association.findOne({
            user: authenticatedUser._id,
        }).select("_id");

        if (association && harvest.association?.equals(association._id)) return;

        const forbiddenError = new Error("Forbidden: insufficient permissions");
        forbiddenError.statusCode = 403;
        throw forbiddenError;
    }

    // Farmers can only modify their own harvests.
    if (harvest.farmer && harvest.farmer.equals(authenticatedUser._id)) return;

    const forbiddenError = new Error("Forbidden: insufficient permissions");
    forbiddenError.statusCode = 403;
    throw forbiddenError;
};

const attachHarvestData = async (harvests) => {
    if (!harvests.length) return [];

    const farmIds = [
        ...new Set(
            harvests.map((h) => h.farm?.toString()).filter(Boolean),
        ),
    ];
    const farmerIds = [
        ...new Set(
            harvests.map((h) => h.farmer?.toString()).filter(Boolean),
        ),
    ];
    const associationIds = [
        ...new Set(
            harvests.map((h) => h.association?.toString()).filter(Boolean),
        ),
    ];

    const [farms, farmers, associations] = await Promise.all([
        farmIds.length
            ? Farm.find({ _id: { $in: farmIds } }).select(
                  "propertyNumber address",
              )
            : [],
        farmerIds.length
            ? User.find({ _id: { $in: farmerIds } }).select(
                  "firstName middleName lastName",
              )
            : [],
        associationIds.length
            ? Association.find({ _id: { $in: associationIds } }).select("name")
            : [],
    ]);

    const farmMap = new Map(farms.map((f) => [f._id.toString(), f]));
    const farmerMap = new Map(farmers.map((f) => [f._id.toString(), f]));
    const associationMap = new Map(
        associations.map((a) => [a._id.toString(), a]),
    );

    return harvests.map((harvest) => {
        const obj = harvest.toObject();
        const farm = farmMap.get(obj.farm?.toString());
        const farmer = farmerMap.get(obj.farmer?.toString());
        const association = associationMap.get(obj.association?.toString());

        return {
            ...obj,
            farm: farm
                ? {
                      _id: farm._id,
                      propertyNumber: farm.propertyNumber,
                      address: farm.address,
                  }
                : null,
            farmer: farmer
                ? { _id: farmer._id, fullName: getFullName(farmer) }
                : null,
            association: association
                ? { _id: association._id, name: association.name }
                : null,
        };
    });
};
