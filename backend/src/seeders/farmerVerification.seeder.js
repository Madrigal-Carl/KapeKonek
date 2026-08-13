import FarmerVerification from "../models/farmerVerification.model.js";
import Association from "../models/association.model.js";

// Indexes into the filtered farmer list (creation order from user.seeder.js),
// pointing at the association each farmer belongs to:
//   farmers [Ramon, Lourdes, Pedro, Elena, Miguel, Rosa]
//     -> assoc [0, 0, 0, 1, 1, 1]
const FARMER_ASSOCIATION_INDEXES = [0, 0, 0, 1, 1, 1];

export const wipeFarmerVerifications = async () => {
    const result = await FarmerVerification.deleteMany({});
    console.log(`  Wiped ${result.deletedCount} farmer verification(s).`);
};

// Requires users and associations to already be seeded — creates an approved
// FarmerVerification linking each farmer to their association, and populates
// that association's assignedFarmers roster.
export const seedFarmerVerifications = async ({
    users = [],
    associations = [],
} = {}) => {
    const farmers = users.filter((user) => user.role === "farmer");

    if (!farmers.length) {
        throw new Error("seedFarmerVerifications requires farmers to already be seeded");
    }
    if (!associations.length) {
        throw new Error("seedFarmerVerifications requires associations to already be seeded");
    }

    const verifications = [];
    const farmerIdsByAssociation = new Map();

    for (const [index, farmer] of farmers.entries()) {
        const association = associations[FARMER_ASSOCIATION_INDEXES[index] ?? 0];

        const verification = await FarmerVerification.create({
            user: farmer._id,
            association: association._id,
            accountStatus: "approved",
            associationStatus: "approved",
            denyRemarks: "",
            associationDenyRemarks: "",
        });

        verifications.push(verification);

        const roster = farmerIdsByAssociation.get(association._id.toString()) ?? [];
        roster.push(farmer._id);
        farmerIdsByAssociation.set(association._id.toString(), roster);

        console.log(
            `  Seeded: ${farmer.firstName} ${farmer.lastName} -> ${association.name}`,
        );
    }

    for (const [associationId, farmerIds] of farmerIdsByAssociation) {
        await Association.updateOne(
            { _id: associationId },
            { $set: { assignedFarmers: farmerIds } },
        );
    }

    return { farmerVerifications: verifications };
};
