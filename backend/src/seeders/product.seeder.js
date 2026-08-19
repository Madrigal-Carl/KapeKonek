import Product from "../models/product.model.js";
import Rating from "../models/rating.model.js";

const COFFEE_IMAGE =
    "https://res.cloudinary.com/dscx3ja7j/image/upload/v1787048168/coffee_enwtx3.jpg";
const BEANS_IMAGE =
    "https://res.cloudinary.com/dscx3ja7j/image/upload/v1787048166/beans_zcswsb.jpg";

const image = (url) => [{ url, isPrimary: true }];

const KALUPPA_PRODUCTS = [
    {
        category: "coffee_beans",
        variety: "arabica",
        stock: 50,
        price: 1200,
        rating: 5,
        ratingMessage: "Premium cooperative-grade Arabica coffee beans every time.",
        description:
            "Cooperative-roasted Arabica beans, traceable from KapeKonek member farms.",
        imageUrl: BEANS_IMAGE,
    },
    {
        category: "fertilizer",
        variety: "arabica",
        stock: 60,
        price: 850,
        rating: 4,
        ratingMessage: "Coffee plants noticeably healthier after use.",
        description:
            "Organic coffee fertilizer stocked by the cooperative for member farms.",
        imageUrl: COFFEE_IMAGE,
    },
    {
        category: "coffee_seedlings",
        variety: "robusta",
        stock: 120,
        price: 45,
        rating: 4,
        ratingMessage: "Strong, uniform Robusta seedlings — high survival rate.",
        description:
            "Healthy Robusta seedlings raised in the cooperative nursery, ready to plant.",
        imageUrl: COFFEE_IMAGE,
    },
];

export const wipeProducts = async () => {
    const result = await Product.deleteMany({});
    console.log(`  Wiped ${result.deletedCount} product(s).`);
};

export const seedProducts = async ({ users = [] } = {}) => {
    const kaluppa = users.find((user) => user.role === "kaluppa");
    const author = users.find((user) => user.role === "buyer") ?? kaluppa;

    if (!kaluppa || !author) {
        throw new Error("seedProducts requires kaluppa and a rating author");
    }

    const products = [];

    for (const data of KALUPPA_PRODUCTS) {
        const product = await Product.create({
            owner: kaluppa._id,
            category: data.category,
            variety: data.variety,
            stock: data.stock ?? null,
            price: data.price,
            status: "active",
            description: data.description,
            imageUrls: image(data.imageUrl),
        });

        await Rating.create({
            author: author._id,
            product: product._id,
            category: data.category,
            variety: data.variety,
            rating: data.rating,
            message: data.ratingMessage ?? "",
        });

        products.push(product);
        console.log(
            `  Seeded: [${data.category.replace("_", " ")} · ${data.variety}] by ${kaluppa.firstName} ${kaluppa.lastName} — ₱${data.price}, ★${data.rating}`,
        );
    }

    return { products };
};
