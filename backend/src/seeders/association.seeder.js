import Association from "../models/association.model.js";

const ASSOCIATIONS_TO_SEED = [
    { name: "Marinduque Coffee Growers Cooperative" },
    { name: "Boac Highland Farmers Association" },
];

export const wipeAssociations = async () => {
    const result = await Association.deleteMany({});
    console.log(`  Wiped ${result.deletedCount} association(s).`);
};

// Requires users to already be seeded — each association is owned by the
// manager at the matching index of the filtered manager list.
export const seedAssociations = async ({ users = [] } = {}) => {
    const managers = users.filter((user) => user.role === "manager");

    if (managers.length < ASSOCIATIONS_TO_SEED.length) {
        throw new Error(
            "seedAssociations requires at least one manager per association to be seeded",
        );
    }

    const associations = [];

    for (const [index, data] of ASSOCIATIONS_TO_SEED.entries()) {
        const manager = managers[index];

        const association = await Association.create({
            name: data.name,
            user: manager._id,
        });

        associations.push(association);
        console.log(
            `  Seeded: ${association.name} (manager: ${manager.firstName} ${manager.lastName})`,
        );
    }

    return { associations };
};
