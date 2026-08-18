import Product from "../models/product.model.js";
import Rating from "../models/rating.model.js";

const BEANS_IMAGE =
    "https://res.cloudinary.com/dscx3ja7j/image/upload/v1787048166/beans_zcswsb.jpg";
const COFFEE_IMAGE =
    "https://res.cloudinary.com/dscx3ja7j/image/upload/v1787048168/coffee_enwtx3.jpg";

const image = (url) => [{ url, isPrimary: true }];

// Owner references are indexes into the filtered farmer list (creation order
// from user.seeder.js): farmers [Ramon, Lourdes, Pedro, Elena, Miguel, Rosa].
// farmIndex points into the seeded farms list — farm N is owned by farmer N,
// so every farmer-owned product sits on the farmer's own plot. Every sample
// has a price set (as if DTI priced it) so it shows up in the marketplace.
const FARMER_PRODUCTS = [
    {
        farmIndex: 0,
        ownerIndex: 0,
        category: "coffee_beans",
        variety: "arabica",
        weight: 2,
        price: 950,
        rating: 5,
        ratingMessage: "Clean, balanced cup — the best lot from the property.",
        description:
            "Washed Arabica beans harvested from Sitio Malabaybay, Agot — sweet, clean and balanced in the cup.",
    },
    {
        farmIndex: 1,
        ownerIndex: 1,
        category: "coffee_cherries",
        variety: "robusta",
        weight: 3,
        price: 700,
        rating: 4,
        ratingMessage: "Fresh and consistent quality, great for our roast.",
        description:
            "Freshly picked Robusta cherries from Sitio Kanluran, Isok I, ready for processing.",
    },
    {
        farmIndex: 2,
        ownerIndex: 2,
        category: "coffee_beans",
        variety: "liberica",
        weight: 2.5,
        price: 875,
        rating: 4,
        ratingMessage: "Distinctive smoky notes, very smooth finish.",
        description:
            "Bold Liberica beans from Sitio Pulo, Boi — fruity, with a distinct smoky finish.",
    },
    {
        farmIndex: 3,
        ownerIndex: 3,
        category: "coffee_cherries",
        variety: "excelsa",
        weight: 4,
        price: 650,
        rating: 3,
        ratingMessage: "Good cherries at a fair price.",
        description:
            "Excelsa cherries harvested from Sitio Baybayin, Poctoy — light and tart, great for blends.",
    },
];

const KALUPPA_PRODUCTS = [
    {
        farmIndex: 0,
        category: "coffee_beans",
        variety: "arabica",
        weight: 5,
        price: 1200,
        rating: 5,
        ratingMessage: "Premium cooperative-grade Arabica every time.",
        description:
            "Cooperative-roasted Arabica beans, traceable from KapeKonek member farms.",
    },
    {
        farmIndex: 1,
        category: "fertilizer",
        variety: "arabica",
        stock: 60,
        price: 850,
        rating: 4,
        ratingMessage: "Rebel plants noticeably healthier after use.",
        description:
            "Organic coffee fertilizer stocked by the cooperative for member farms.",
    },
    {
        farmIndex: 2,
        category: "coffee_seedlings",
        variety: "robusta",
        stock: 120,
        price: 45,
        rating: 4,
        ratingMessage: "Strong, uniform seedlings — high survival rate.",
        description:
            "Healthy Robusta seedlings raised in the cooperative nursery, ready to plant.",
    },
    {
        farmIndex: 3,
        category: "coffee_beans",
        variety: "robusta",
        weight: 4,
        price: 980,
        rating: 4,
        ratingMessage: "Chocolatey and full-bodied, a crowd favorite.",
        description:
            "Cooperative Robusta beans, full-bodied with a chocolatey profile.",
    },
];

export const wipeProducts = async () => {
    const result = await Product.deleteMany({});
    console.log(`  Wiped ${result.deletedCount} product(s).`);
};

// Requires users and farms to already be seeded — creates farmer-owned sample
// products (beans image) and kaluppa-owned sample products (coffee image),
// each with a price already set.
export const seedProducts = async ({ users = [], farms = [] } = {}) => {
    const farmers = users.filter((user) => user.role === "farmer");
    const kaluppa = users.find((user) => user.role === "kaluppa");
    const author = users.find((user) => user.role === "buyer") ?? kaluppa;

    if (!farmers.length || !kaluppa || !author) {
        throw new Error("seedProducts requires farmers, kaluppa, and a rating author");
    }
    if (!farms.length) {
        throw new Error("seedProducts requires farms to be seeded");
    }

    const products = [];

    const create = async (data, ownerName, owner) => {
        const farm = farms[data.farmIndex];

        if (!farm) {
            throw new Error(`Invalid farm reference for product (farmIndex ${data.farmIndex})`);
        }

        const product = await Product.create({
            farm: farm._id,
            owner: owner._id,
            category: data.category,
            variety: data.variety,
            stock: data.stock ?? null,
            weight: data.weight ?? undefined,
            price: data.price,
            status: "active",
            description: data.description,
            imageUrls: image(data.imageUrl),
        });

        await Rating.create({
            author: author._id,
            farm: farm._id,
            category: data.category,
            variety: data.variety,
            rating: data.rating,
            message: data.ratingMessage ?? "",
        });

        products.push(product);
        console.log(
            `  Seeded: [${data.category.replace("_", " ")} · ${data.variety}] by ${ownerName} @ ${farm.propertyNumber} — ₱${data.price}, ★${data.rating}`,
        );

        return product;
    };

    for (const data of FARMER_PRODUCTS) {
        const owner = farmers[data.ownerIndex];

        if (!owner) {
            throw new Error(`Invalid farmer reference for product (ownerIndex ${data.ownerIndex})`);
        }

        await create(
            { ...data, imageUrl: BEANS_IMAGE },
            `${owner.firstName} ${owner.lastName}`,
            owner,
        );
    }

    for (const data of KALUPPA_PRODUCTS) {
        await create(
            { ...data, imageUrl: COFFEE_IMAGE },
            `${kaluppa.firstName} ${kaluppa.lastName}`,
            kaluppa,
        );
    }

    return { products };
};
