import Farm from "../models/farm.model.js";

// ownerIndex / farmerIndexes are indexes into the filtered farmer list
// (creation order from user.seeder.js):
//   farmers [Ramon, Lourdes, Pedro, Elena, Miguel, Rosa]
// associationIndex points into the seeded associations list.
const FARMS_TO_SEED = [
    {
        propertyNumber: "TCT-2024-0001",
        address: "Sitio Malabaybay, Brgy. Agot, Boac, Marinduque",
        size: 2.5,
        latitude: 13.4762,
        longitude: 121.8563,
        associationIndex: 0,
        ownerIndex: 0,
        farmerIndexes: [0, 1],
    },
    {
        propertyNumber: "TCT-2024-0002",
        address: "Sitio Kanluran, Brgy. Isok I, Boac, Marinduque",
        size: 1.8,
        latitude: 13.4468,
        longitude: 121.8432,
        associationIndex: 0,
        ownerIndex: 1,
        farmerIndexes: [1],
    },
    {
        propertyNumber: "TCT-2024-0003",
        address: "Sitio Pulo, Brgy. Boi, Boac, Marinduque",
        size: 3.2,
        latitude: 13.4108,
        longitude: 121.8022,
        associationIndex: 0,
        ownerIndex: 2,
        farmerIndexes: [2, 0],
    },
    {
        propertyNumber: "TCT-2024-0004",
        address: "Sitio Baybayin, Brgy. Poctoy, Boac, Marinduque",
        size: 4.1,
        latitude: 13.5012,
        longitude: 121.8895,
        associationIndex: 1,
        ownerIndex: 3,
        farmerIndexes: [3, 4],
    },
    {
        propertyNumber: "TCT-2024-0005",
        address: "Sitio Wawa, Brgy. Balimbing, Boac, Marinduque",
        size: 1.5,
        latitude: 13.4857,
        longitude: 121.8712,
        associationIndex: 1,
        ownerIndex: 4,
        farmerIndexes: [4],
    },
    {
        propertyNumber: "TCT-2024-0006",
        address: "Sitio Dulong Bayan, Brgy. Laylay, Boac, Marinduque",
        size: 2.9,
        latitude: 13.4395,
        longitude: 121.8328,
        associationIndex: 1,
        ownerIndex: 5,
        farmerIndexes: [5, 3],
    },
];

export const wipeFarms = async () => {
    const result = await Farm.deleteMany({});
    console.log(`  Wiped ${result.deletedCount} farm(s).`);
};

// Requires users and associations to already be seeded — each farm gets its
// owner (a farmer), the association it belongs to, and its assigned farmer
// roster resolved from the seeded farmers.
export const seedFarms = async ({ users = [], associations = [] } = {}) => {
    const farmers = users.filter((user) => user.role === "farmer");

    if (!farmers.length) {
        throw new Error("seedFarms requires farmers to already be seeded");
    }
    if (!associations.length) {
        throw new Error("seedFarms requires associations to already be seeded");
    }

    const farms = [];

    for (const data of FARMS_TO_SEED) {
        const association = associations[data.associationIndex];
        const owner = farmers[data.ownerIndex];

        if (!association || !owner) {
            throw new Error(
                `Invalid seed reference for farm ${data.propertyNumber}`,
            );
        }

        const assignedFarmers = data.farmerIndexes.map(
            (index) => farmers[index]._id,
        );

        const farm = await Farm.create({
            propertyNumber: data.propertyNumber,
            address: data.address,
            size: data.size,
            latitude: data.latitude,
            longitude: data.longitude,
            association: association._id,
            owner: owner._id,
            assignedFarmers,
        });

        farms.push(farm);

        const ownerName = `${owner.firstName} ${owner.lastName}`;
        const farmerCount = assignedFarmers.length;
        console.log(
            `  Seeded: ${farm.propertyNumber} -> ${association.name} (owner: ${ownerName}, ${farmerCount} farmer${farmerCount === 1 ? "" : "s"})`,
        );
    }

    return { farms };
};
