import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import Association from "../models/association.model.js";
import FarmerVerification from "../models/farmerVerification.model.js";
import Farm from "../models/farm.model.js";

export const getUsers = async ({ role, all, page, limit }, authenticatedUser) => {
    const filter = { deletedAt: null };

    if (authenticatedUser.role === "manager") {
        const association = await Association.findOne({
            user: authenticatedUser._id,
        }).select("assignedFarmers");

        filter._id = {
            $in: (association?.assignedFarmers ?? []).map((id) => id.toString()),
        };
        filter.role = "farmer";
    } else if (role) {
        filter.role = role;
    }

    const effectiveRole = authenticatedUser.role === "manager" ? "farmer" : role;

    if (all) {
        const users = await User.find(filter).sort({ createdAt: -1 });

        return {
            users: await attachUserData(users, effectiveRole),
            pagination: null,
        };
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(filter),
    ]);

    return {
        users: await attachUserData(users, effectiveRole),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
};

export const getAvailableFarmers = async () => {
    const assignedFarmerIds = await Association.distinct("assignedFarmers");

    const farmers = await User.find({
        role: "farmer",
        deletedAt: null,
        _id: { $nin: assignedFarmerIds },
    }).sort({ createdAt: -1 });

    return farmers.map((user) => {
        const obj = user.toObject();

        return {
            ...obj,
            fullName: getFullName(obj),
            joinedAt: obj.createdAt,
        };
    });
};

export const createUser = async (data, authenticatedUser) => {
    const { association, assignedFarmers, ...userData } = data;

    if (authenticatedUser.role === "manager" && userData.role !== "farmer") {
        const forbiddenError = new Error(
            "Managers can only create farmer accounts",
        );
        forbiddenError.statusCode = 403;
        throw forbiddenError;
    }

    await checkUserFieldConflicts(userData);

    if (userData.role === "manager" && association) {
        const existingAssociation = await Association.findOne({
            name: new RegExp(`^${escapeRegex(association.trim())}$`, "i"),
        });

        if (existingAssociation) {
            const conflictError = new Error("Association already exists");
            conflictError.statusCode = 409;
            throw conflictError;
        }
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await User.create({
        ...userData,
        password: hashedPassword,
        isVerified: true,
    });

    if (userData.role === "manager" && association) {
        const farmerIds = uniqueIds(assignedFarmers);

        await Association.create({
            user: user._id,
            name: association.trim(),
            assignedFarmers: farmerIds,
        });

        for (const farmerId of farmerIds) {
            await linkFarmerToManager(farmerId, user._id);
        }
    }

    if (authenticatedUser.role === "manager") {
        await linkFarmerToManager(user._id, authenticatedUser._id);
    }

    return user;
};

export const updateUser = async (id, data, authenticatedUser) => {
    const target = await User.findOne({ _id: id, deletedAt: null });

    if (!target) {
        const notFoundError = new Error("User not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    await assertCanModifyUser(target, authenticatedUser);

    const { association, assignedFarmers, ...updateData } = data;

    if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 12);
    }

    await checkUserFieldConflicts(updateData, target._id);

    if (updateData.files !== undefined && target.role === "farmer") {
        const verification = await FarmerVerification.findOne({
            user: target._id,
        });

        if (verification && verification.accountStatus === "rejected") {
            verification.accountStatus = "pending";
            verification.denyRemarks = "";
            await verification.save();
        }
    }

    if (target.role === "manager" && (association || assignedFarmers)) {
        const farmerIds = assignedFarmers ? uniqueIds(assignedFarmers) : undefined;

        if (association) {
            const existingAssociation = await Association.findOne({
                name: new RegExp(`^${escapeRegex(association.trim())}$`, "i"),
            });

            if (existingAssociation && !existingAssociation.user.equals(target._id)) {
                const conflictError = new Error("Association already exists");
                conflictError.statusCode = 409;
                throw conflictError;
            }
        }

        const managerAssociation = await Association.findOne({
            user: target._id,
        });

        if (managerAssociation) {
            const previousFarmerIds = (managerAssociation.assignedFarmers ?? []).map(
                (farmerId) => farmerId.toString(),
            );

            if (association) managerAssociation.name = association.trim();
            if (farmerIds) managerAssociation.assignedFarmers = farmerIds;
            await managerAssociation.save();

            if (farmerIds) {
                const added = farmerIds.filter(
                    (farmerId) => !previousFarmerIds.includes(farmerId),
                );
                const removed = previousFarmerIds.filter(
                    (farmerId) => !farmerIds.includes(farmerId),
                );

                for (const farmerId of added) {
                    await linkFarmerToManager(farmerId, target._id);
                }
                for (const farmerId of removed) {
                    await unlinkFarmer(farmerId);
                }
            }
        } else if (association) {
            const farmerIdsToLink = uniqueIds(assignedFarmers);

            await Association.create({
                user: target._id,
                name: association.trim(),
                assignedFarmers: farmerIdsToLink,
            });

            for (const farmerId of farmerIdsToLink) {
                await linkFarmerToManager(farmerId, target._id);
            }
        }
    }

    const user = await User.findByIdAndUpdate(
        target._id,
        { $set: updateData },
        { returnDocument: "after", runValidators: true },
    );

    return user;
};

export const deleteUser = async (id, authenticatedUser) => {
    const target = await User.findOne({ _id: id, deletedAt: null });

    if (!target) {
        const notFoundError = new Error("User not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    await assertCanModifyUser(target, authenticatedUser);

    const user = await User.findOneAndUpdate(
        { _id: target._id, deletedAt: null },
        { $set: { deletedAt: new Date() } },
        { returnDocument: "after" },
    );

    return user;
};

export const reviewAccount = async (id, { status, remarks }, authenticatedUser) => {
    if (!["kaluppa", "dti"].includes(authenticatedUser.role)) {
        const forbiddenError = new Error("Forbidden: insufficient permissions");
        forbiddenError.statusCode = 403;
        throw forbiddenError;
    }

    const verification = await FarmerVerification.findOneAndUpdate(
        { user: id },
        {
            $set: {
                accountStatus: status,
                denyRemarks: status === "rejected" ? (remarks ?? "") : "",
            },
        },
        { returnDocument: "after" },
    );

    if (!verification) {
        const notFoundError = new Error("Farmer verification not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    return verification;
};

export const reviewAssociation = async (id, { status, remarks }, authenticatedUser) => {
    if (authenticatedUser.role !== "manager") {
        const forbiddenError = new Error("Forbidden: insufficient permissions");
        forbiddenError.statusCode = 403;
        throw forbiddenError;
    }

    const association = await Association.findOne({
        user: authenticatedUser._id,
    });

    if (!association) {
        const notFoundError = new Error("Association not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    const verification = await FarmerVerification.findOne({
        user: id,
        association: association._id,
    });

    if (!verification) {
        const notFoundError = new Error("Farmer verification not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    const isRejecting = status === "rejected";

    if (isRejecting) {
        association.assignedFarmers = association.assignedFarmers.filter(
            (farmerId) => !farmerId.equals(id),
        );
        await association.save();
    }

    const updatedVerification = await FarmerVerification.findOneAndUpdate(
        { _id: verification._id },
        {
            $set: {
                associationStatus: status,
                associationDenyRemarks: isRejecting ? (remarks ?? "") : "",
                ...(isRejecting ? { association: null } : {}),
            },
        },
        { returnDocument: "after" },
    );

    return updatedVerification;
};

const checkUserFieldConflicts = async (data, excludeId) => {
    const conditions = [];

    if (data.email) conditions.push({ email: data.email.toLowerCase() });
    if (data.username) conditions.push({ username: data.username });
    if (data.contactNumber) conditions.push({ contactNumber: data.contactNumber });

    if (!conditions.length) return;

    const existing = await User.findOne({
        ...(excludeId ? { _id: { $ne: excludeId } } : {}),
        $or: conditions,
    });

    if (existing) {
        const conflictingFields = [];

        if (data.email && existing.email === data.email.toLowerCase()) {
            conflictingFields.push("Email");
        }
        if (data.username && existing.username === data.username) {
            conflictingFields.push("Username");
        }
        if (
            data.contactNumber &&
            existing.contactNumber === data.contactNumber
        ) {
            conflictingFields.push("Contact number");
        }

        const label = conflictingFields.length
            ? conflictingFields.join(", ")
            : "Email, username, or contact number";

        const conflictError = new Error(`${label} already exists`);
        conflictError.statusCode = 409;
        throw conflictError;
    }
};

const assertCanModifyUser = async (target, authenticatedUser) => {
    if (authenticatedUser.role === "kaluppa") return;

    if (authenticatedUser.role === "manager") {
        const inAssociation = await isFarmerInManagerAssociation(
            target._id,
            authenticatedUser._id,
        );

        if (target.role === "farmer" && inAssociation) return;
    }

    const forbiddenError = new Error("Forbidden: insufficient permissions");
    forbiddenError.statusCode = 403;
    throw forbiddenError;
};

const isFarmerInManagerAssociation = async (farmerId, managerId) => {
    const association = await Association.findOne({ user: managerId }).select(
        "_id",
    );

    if (!association) return false;

    const verification = await FarmerVerification.findOne({
        user: farmerId,
        association: association._id,
    });

    return Boolean(verification);
};

const linkFarmerToManager = async (farmerId, managerId) => {
    const association = await Association.findOne({ user: managerId });

    if (!association) return;

    if (!association.assignedFarmers.some((id) => id.equals(farmerId))) {
        association.assignedFarmers.push(farmerId);
        await association.save();
    }

    await FarmerVerification.findOneAndUpdate(
        { user: farmerId },
        {
            $set: {
                association: association._id,
                associationStatus: "pending",
                associationDenyRemarks: "",
            },
            $setOnInsert: {
                accountStatus: "pending",
                denyRemarks: "",
            },
        },
        { upsert: true },
    );
};

const unlinkFarmer = async (farmerId) => {
    await FarmerVerification.updateOne(
        { user: farmerId },
        {
            $set: {
                association: null,
                associationStatus: "rejected",
                associationDenyRemarks: "",
            },
        },
    );
};

const getFullName = (user) =>
    [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

const attachUserData = async (users, requestedRole) => {
    if (!users.length) return [];

    if (requestedRole === "manager") {
        const associations = await Association.find({
            user: { $in: users.map((u) => u._id) },
        }).select("user name assignedFarmers");

        const associationByUser = new Map(
            associations.map((a) => [a.user.toString(), a]),
        );

        const assignedFarmerIds = [
            ...new Set(
                associations.flatMap((a) =>
                    (a.assignedFarmers ?? []).map((id) => id.toString()),
                ),
            ),
        ];

        const farmers = assignedFarmerIds.length
            ? await User.find({ _id: { $in: assignedFarmerIds } }).select(
                  "firstName middleName lastName",
              )
            : [];

        const nameByFarmer = new Map(
            farmers.map((f) => [f._id.toString(), getFullName(f)]),
        );

        return users.map((u) => {
            const obj = u.toObject();
            const association = associationByUser.get(obj._id.toString());
            const assignedFarmers = (association?.assignedFarmers ?? []).map(
                (id) => {
                    const farmerId = id.toString();

                    return {
                        _id: farmerId,
                        fullName: nameByFarmer.get(farmerId) ?? farmerId,
                    };
                },
            );

            return {
                ...obj,
                fullName: getFullName(obj),
                joinedAt: obj.createdAt,
                association: association?.name ?? null,
                assignedFarmers,
                farmerCount: assignedFarmers.length,
            };
        });
    }

    if (requestedRole === "farmer") {
        const verifications = await FarmerVerification.find({
            user: { $in: users.map((u) => u._id) },
        }).select(
            "user association accountStatus associationStatus denyRemarks associationDenyRemarks",
        );

        const verificationByUser = new Map(
            verifications.map((v) => [v.user.toString(), v]),
        );

        const associationIds = [
            ...new Set(
                verifications
                    .map((v) => v.association?.toString())
                    .filter(Boolean),
            ),
        ];

        const associations = await Association.find({
            _id: { $in: associationIds },
        }).select("name");

        const nameByAssociation = new Map(
            associations.map((a) => [a._id.toString(), a.name]),
        );

        const farms = await Farm.find({
            assignedFarmers: { $in: users.map((u) => u._id) },
        }).select("assignedFarmers");

        const countByFarmer = new Map();
        for (const farm of farms) {
            for (const farmerId of farm.assignedFarmers) {
                const key = farmerId.toString();
                countByFarmer.set(key, (countByFarmer.get(key) ?? 0) + 1);
            }
        }

        return users.map((u) => {
            const obj = u.toObject();
            const verification = verificationByUser.get(obj._id.toString());

            return {
                ...obj,
                fullName: getFullName(obj),
                joinedAt: obj.createdAt,
                association: verification?.association
                    ? nameByAssociation.get(verification.association.toString()) ??
                    null
                    : null,
                accountStatus: verification?.accountStatus ?? null,
                associationStatus: verification?.associationStatus ?? null,
                denyRemarks: verification?.denyRemarks ?? null,
                associationDenyRemarks:
                    verification?.associationDenyRemarks ?? null,
                farmCount: countByFarmer.get(obj._id.toString()) ?? 0,
            };
        });
    }

    return users.map((u) => {
        const obj = u.toObject();
        return {
            ...obj,
            fullName: getFullName(obj),
            joinedAt: obj.createdAt,
        };
    });
};

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const uniqueIds = (ids) =>
    [...new Set((ids ?? []).map((id) => id.toString()))];
