import Association from "../models/association.model.js";

export const getAssociations = async () => {
    const associations = await Association.find({})
        .select("name")
        .sort({ name: 1 });

    return associations.map((association) => ({
        _id: association._id,
        name: association.name,
    }));
};
