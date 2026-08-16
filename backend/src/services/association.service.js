import Association from "../models/association.model.js";
import User from "../models/user.model.js";

const getFullName = (user) =>
    [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

export const getAssociations = async () => {
    const associations = await Association.find({})
        .select("name")
        .sort({ name: 1 });

    return associations.map((association) => ({
        _id: association._id,
        name: association.name,
    }));
};

export const getAssociationFarmers = async (id) => {
    const association = await Association.findById(id).select(
        "assignedFarmers",
    );

    if (!association) {
        const notFoundError = new Error("Association not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    const farmerIds = (association.assignedFarmers ?? []).map((farmerId) =>
        farmerId.toString(),
    );

    const farmers = farmerIds.length
        ? await User.find({
              _id: { $in: farmerIds },
              role: "farmer",
              deletedAt: null,
          }).select("firstName middleName lastName")
        : [];

    return farmers.map((farmer) => ({
        _id: farmer._id,
        fullName: getFullName(farmer),
    }));
};
