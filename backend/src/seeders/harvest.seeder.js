import Harvest from "../models/harvest.model.js";

const VARIETIES = ["arabica", "robusta", "liberica", "excelsa"];

// Each farm gets 3, 4, or 5 harvests — cycling deterministically so the
// distribution is stable across seed runs.
const COUNTS = [3, 4, 5];

const seededYieldKg = (farmIndex, i) => ((farmIndex * 137 + i * 53) % 900) + 300;

const seededDate = (farmIndex, i) =>
    new Date(2026, 5, 1 + ((farmIndex * 5 + i * 7) % 28));

export const wipeHarvests = async () => {
    const result = await Harvest.deleteMany({});
    console.log(`  Wiped ${result.deletedCount} harvest(s).`);
};

// Requires farms and users to already be seeded — every farm gets 3-5
// harvests, each assigned to one of the farm's farmers, the farm's
// association, a cycling variety, and a plausible yield/date.
export const seedHarvests = async ({ farms = [] } = {}) => {
    if (!farms.length) {
        throw new Error("seedHarvests requires farms to already be seeded");
    }

    const harvests = [];

    for (const [farmIndex, farm] of farms.entries()) {
        const count = COUNTS[farmIndex % COUNTS.length];

        for (let i = 0; i < count; i++) {
            const farmerId =
                farm.assignedFarmers?.length
                    ? farm.assignedFarmers[i % farm.assignedFarmers.length]
                    : farm.owner;

            const harvest = await Harvest.create({
                farm: farm._id,
                farmer: farmerId,
                association: farm.association,
                variety: VARIETIES[(farmIndex + i) % VARIETIES.length],
                yieldKg: seededYieldKg(farmIndex, i),
                harvestedAt: seededDate(farmIndex, i),
            });

            harvests.push(harvest);
        }

        console.log(
            `  Seeded: ${count} harvest(s) for ${farm.propertyNumber}`,
        );
    }

    return { harvests };
};
