import Farm from "../models/farm.model.js";
import User from "../models/user.model.js";
import Association from "../models/association.model.js";
import FarmerVerification from "../models/farmerVerification.model.js";

const getFullName = (user) =>
    [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

export const getFarms = async (
    { all, page, limit, minSize, maxSize },
    authenticatedUser,
) => {
    const filter = { deletedAt: null };

    if (minSize !== undefined || maxSize !== undefined) {
        filter.size = {};
        if (minSize !== undefined) filter.size.$gte = minSize;
        if (maxSize !== undefined) filter.size.$lte = maxSize;
    }

    if (authenticatedUser.role === "manager") {
        const association = await Association.findOne({
            user: authenticatedUser._id,
        }).select("_id");

        if (!association) {
            return all
                ? { farms: [], pagination: null }
                : {
                      farms: [],
                      pagination: { page, limit, total: 0, totalPages: 1 },
                  };
        }

        filter.association = association._id;
    } else if (authenticatedUser.role === "farmer") {
        filter.assignedFarmers = authenticatedUser._id;
    }

    if (all) {
        const farms = await Farm.find(filter).sort({ createdAt: -1 });

        return {
            farms: await attachFarmData(farms),
            pagination: null,
        };
    }

    const skip = (page - 1) * limit;

    const [farms, total] = await Promise.all([
        Farm.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Farm.countDocuments(filter),
    ]);

    return {
        farms: await attachFarmData(farms),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
};

export const getJoinableFarms = async (authenticatedUser) => {
    const verification = await FarmerVerification.findOne({
        user: authenticatedUser._id,
    }).select("association");

    if (!verification?.association) {
        return { farms: [] };
    }

    const farms = await Farm.find({
        deletedAt: null,
        association: verification.association,
        assignedFarmers: { $ne: authenticatedUser._id },
        owner: { $ne: authenticatedUser._id },
    }).sort({ createdAt: -1 });

    return {
        farms: await attachFarmData(farms),
    };
};

export const joinFarm = async (id, authenticatedUser) => {
    const verification = await FarmerVerification.findOne({
        user: authenticatedUser._id,
    }).select("association");

    if (!verification?.association) {
        const forbiddenError = new Error(
            "You must belong to an association to join a farm",
        );
        forbiddenError.statusCode = 403;
        throw forbiddenError;
    }

    const farm = await Farm.findOne({ _id: id, deletedAt: null });

    if (!farm) {
        const notFoundError = new Error("Farm not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    if (
        !farm.association ||
        !farm.association.equals(verification.association)
    ) {
        const forbiddenError = new Error(
            "You can only join farms in your own association",
        );
        forbiddenError.statusCode = 403;
        throw forbiddenError;
    }

    if (farm.owner && farm.owner.equals(authenticatedUser._id)) {
        const badRequestError = new Error("You already own this farm");
        badRequestError.statusCode = 400;
        throw badRequestError;
    }

    await addFarmerToFarm(farm, authenticatedUser._id);

    return attachFarmData([farm]).then(([attached]) => attached);
};

export const leaveFarm = async (id, authenticatedUser) => {
    const farm = await Farm.findOne({ _id: id, deletedAt: null });

    if (!farm) {
        const notFoundError = new Error("Farm not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    if (farm.owner && farm.owner.equals(authenticatedUser._id)) {
        const badRequestError = new Error(
            "Farm owners cannot leave their own farm",
        );
        badRequestError.statusCode = 400;
        throw badRequestError;
    }

    if (
        !farm.assignedFarmers.some((farmerId) =>
            farmerId.equals(authenticatedUser._id),
        )
    ) {
        const badRequestError = new Error(
            "You are not assigned to this farm",
        );
        badRequestError.statusCode = 400;
        throw badRequestError;
    }

    farm.assignedFarmers = farm.assignedFarmers.filter(
        (farmerId) => !farmerId.equals(authenticatedUser._id),
    );
    await farm.save();

    return attachFarmData([farm]).then(([attached]) => attached);
};

export const createFarm = async (data, authenticatedUser) => {
    const propertyNumber = data.propertyNumber.trim().toUpperCase();

    const existing = await Farm.findOne({
        propertyNumber: new RegExp(`^${escapeRegex(propertyNumber)}$`, "i"),
    });

    if (existing) {
        // Only farmers may join an existing farm by property number.
        // Manager/kaluppa creations collide instead.
        if (authenticatedUser.role !== "farmer") {
            const conflictError = new Error(
                "A farm with this property number already exists",
            );
            conflictError.statusCode = 409;
            throw conflictError;
        }

        if (existing.deletedAt) {
            // The property number exists but the farm was soft-deleted —
            // restore it instead of creating a duplicate.
            existing.deletedAt = null;
        }

        // The farm already exists — the farmer joins it instead of editing it.
        // They only get added to assignedFarmers; ownership stays with the
        // original creator.
        await addFarmerToFarm(existing, authenticatedUser._id);

        return attachFarmData([existing]).then(([farm]) => farm);
    }

    let association;
    let owner;
    let assignedFarmers;

    if (authenticatedUser.role === "manager") {
        // Manager-created farms automatically belong to the manager's own
        // association and may assign farmers from that association.
        const managerAssociation = await Association.findOne({
            user: authenticatedUser._id,
        }).select("_id assignedFarmers");

        if (!managerAssociation) {
            const forbiddenError = new Error(
                "You must have an association to create a farm",
            );
            forbiddenError.statusCode = 403;
            throw forbiddenError;
        }

        association = managerAssociation._id;
        owner = authenticatedUser._id;
        assignedFarmers = (data.assignedFarmers ?? []).filter((farmerId) =>
            managerAssociation.assignedFarmers.some((id) => id.equals(farmerId)),
        );
    } else if (authenticatedUser.role === "kaluppa") {
        // Kaluppa picks the association the farm should belong to; the
        // manager of that association later assigns the farmers.
        if (!data.association) {
            const badRequestError = new Error(
                "Please select an association for the farm",
            );
            badRequestError.statusCode = 400;
            throw badRequestError;
        }

        association = data.association;
        owner = authenticatedUser._id;
        assignedFarmers = [];
    } else {
        // Farmer-created farms belong to the farmer's own association and
        // the farmer becomes the owner.
        const verification = await FarmerVerification.findOne({
            user: authenticatedUser._id,
        }).select("association");

        if (!verification?.association) {
            const forbiddenError = new Error(
                "You must belong to an association to create a farm",
            );
            forbiddenError.statusCode = 403;
            throw forbiddenError;
        }

        association = verification.association;
        owner = authenticatedUser._id;
        assignedFarmers = [authenticatedUser._id];
    }

    const { association: _ignoredAssociation, assignedFarmers: _ignoredFarmers, ...rest } = data;

    let farm;

    try {
        farm = await Farm.create({
            ...rest,
            propertyNumber,
            association,
            owner,
            assignedFarmers,
        });
    } catch (error) {
        // Concurrent creation with the same property number — join or restore
        // the winner instead of failing (farmers only).
        if (error.code === 11000) {
            const joined = await Farm.findOne({
                propertyNumber: new RegExp(
                    `^${escapeRegex(propertyNumber)}$`,
                    "i",
                ),
            });

            if (joined && authenticatedUser.role === "farmer") {
                if (joined.deletedAt) joined.deletedAt = null;

                await addFarmerToFarm(joined, authenticatedUser._id);

                return attachFarmData([joined]).then(([farmDoc]) => farmDoc);
            }

            if (joined) {
                const conflictError = new Error(
                    "A farm with this property number already exists",
                );
                conflictError.statusCode = 409;
                throw conflictError;
            }

            // No farm matches this property number — the conflict is stale
            // index data, not a real duplicate.
            const conflictError = new Error(
                "Could not create farm. Please try again.",
            );
            conflictError.statusCode = 409;
            throw conflictError;
        }

        throw error;
    }

    return attachFarmData([farm]).then(([attached]) => attached);
};

export const updateFarm = async (id, data, authenticatedUser) => {
    const farm = await Farm.findOne({ _id: id, deletedAt: null });

    if (!farm) {
        const notFoundError = new Error("Farm not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    await assertCanModifyFarm(farm, authenticatedUser);

    const updateData = { ...data };

    if (data.propertyNumber) {
        updateData.propertyNumber = data.propertyNumber.trim().toUpperCase();
    }

    if (authenticatedUser.role === "farmer") {
        // Farmers only edit their own farm's details — never reassign the
        // association or the farmer roster.
        delete updateData.association;
        delete updateData.assignedFarmers;
    }

    if (authenticatedUser.role === "manager") {
        delete updateData.association;

        if (data.assignedFarmers) {
            const association = await Association.findOne({
                user: authenticatedUser._id,
            }).select("assignedFarmers");

            updateData.assignedFarmers = data.assignedFarmers.filter((farmerId) =>
                (association?.assignedFarmers ?? []).some((id) => id.equals(farmerId)),
            );
        }
    }

    const updated = await Farm.findOneAndUpdate(
        { _id: farm._id, deletedAt: null },
        { $set: updateData },
        { returnDocument: "after", runValidators: true },
    );

    return attachFarmData([updated]).then(([attached]) => attached);
};

export const deleteFarm = async (id, authenticatedUser) => {
    const farm = await Farm.findOne({ _id: id, deletedAt: null });

    if (!farm) {
        const notFoundError = new Error("Farm not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    await assertCanModifyFarm(farm, authenticatedUser);

    const deleted = await Farm.findOneAndUpdate(
        { _id: farm._id, deletedAt: null },
        { $set: { deletedAt: new Date() } },
        { returnDocument: "after" },
    );

    return attachFarmData([deleted]).then(([attached]) => attached);
};

const assertCanModifyFarm = async (farm, authenticatedUser) => {
    // Kaluppa can edit any farm.
    if (authenticatedUser.role === "kaluppa") return;

    // Managers can only edit farms inside their own association.
    if (authenticatedUser.role === "manager") {
        const association = await Association.findOne({
            user: authenticatedUser._id,
        }).select("_id");

        if (association && farm.association?.equals(association._id)) return;

        const forbiddenError = new Error("Forbidden: insufficient permissions");
        forbiddenError.statusCode = 403;
        throw forbiddenError;
    }

    // Farmers can only edit the farms they own.
    if (farm.owner && farm.owner.equals(authenticatedUser._id)) return;

    const forbiddenError = new Error("Forbidden: insufficient permissions");
    forbiddenError.statusCode = 403;
    throw forbiddenError;
};

const addFarmerToFarm = async (farm, farmerId) => {
    if (!farm.assignedFarmers.some((id) => id.equals(farmerId))) {
        farm.assignedFarmers.push(farmerId);
        await farm.save();
    }
};

const attachFarmData = async (farms) => {
    if (!farms.length) return [];

    const userIds = [
        ...new Set(
            farms.flatMap((farm) => [
                farm.owner?.toString(),
                ...(farm.assignedFarmers ?? []).map((id) => id.toString()),
            ]).filter(Boolean),
        ),
    ];

    const associationIds = [
        ...new Set(
            farms
                .map((farm) => farm.association?.toString())
                .filter(Boolean),
        ),
    ];

    const [users, associations] = await Promise.all([
        userIds.length
            ? User.find({ _id: { $in: userIds } }).select(
                  "firstName middleName lastName",
              )
            : [],
        associationIds.length
            ? Association.find({ _id: { $in: associationIds } }).select("name")
            : [],
    ]);

    const nameByUser = new Map(users.map((u) => [u._id.toString(), getFullName(u)]));
    const nameByAssociation = new Map(
        associations.map((a) => [a._id.toString(), a.name]),
    );

    return farms.map((farm) => {
        const obj = farm.toObject();
        const ownerId = obj.owner?.toString();
        const associationId = obj.association?.toString();

        return {
            ...obj,
            owner: ownerId
                ? { _id: ownerId, fullName: nameByUser.get(ownerId) ?? ownerId }
                : null,
            association: associationId
                ? {
                      _id: associationId,
                      name: nameByAssociation.get(associationId) ?? null,
                  }
                : null,
            assignedFarmers: (obj.assignedFarmers ?? []).map((farmerId) => {
                const id = farmerId.toString();

                return {
                    _id: id,
                    fullName: nameByUser.get(id) ?? id,
                };
            }),
        };
    });
};

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
