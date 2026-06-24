import hero from "@/assets/images/hero-coffee.jpg";
import community from "@/assets/images/community.jpg";
import farm from "@/assets/images/coffee-farm.jpg";

export const CATEGORIES = [
    "Beans",
    "Green Coffee",
    "Roasted Coffee",
    "Ground Coffee",
    "Specialty Lots",
];

const SELLERS = [
    { name: "Sagada Highland Co-op", location: "Sagada, Mountain Province", rating: 4.8, sold: 1240 },
    { name: "Benguet Arabica Farm", location: "Atok, Benguet", rating: 4.7, sold: 980 },
    { name: "Bukidnon Coffee Collective", location: "Malaybalay, Bukidnon", rating: 4.6, sold: 760 },
    { name: "Kalinga Heirloom Growers", location: "Tabuk, Kalinga", rating: 4.9, sold: 1420 },
    { name: "Cavite Lowland Roasters", location: "Amadeo, Cavite", rating: 4.5, sold: 540 },
    { name: "Davao Origin Farms", location: "Mt. Apo, Davao", rating: 4.8, sold: 1110 },
];

const NAMES = [
    "Highland Arabica · Lot 02",
    "Honey-Process Green Beans",
    "Medium Roast · Single Origin",
    "Fine Ground · House Blend",
    "Specialty Geisha · Reserve",
    "Natural-Process Wholebean",
    "Dark Roast · Espresso Cut",
    "Washed Bourbon · Microlot",
    "Robusta Lowland · Bulk",
    "Anaerobic Specialty Lot",
    "Coarse Ground · Cold Brew",
    "Heirloom Typica · Reserve",
];

const IMAGES = [hero, community, farm];

function buildProducts() {
    const out = [];
    for (let i = 0; i < NAMES.length; i++) {
        const name = NAMES[i];
        const category = CATEGORIES[i % CATEGORIES.length];
        const seller = SELLERS[i % SELLERS.length];
        const image = IMAGES[i % IMAGES.length];
        const price = 320 + ((i * 73) % 9) * 60;
        const weight = [0.25, 0.5, 1, 2][i % 4];
        out.push({
            id: `kk-${(i + 1).toString().padStart(3, "0")}`,
            name,
            category,
            price,
            weightKg: weight,
            stock: 24 + ((i * 17) % 80),
            image,
            gallery: [image, IMAGES[(i + 1) % IMAGES.length], IMAGES[(i + 2) % IMAGES.length]],
            seller: seller.name,
            sellerLocation: seller.location,
            sellerRating: seller.rating,
            sellerProductsSold: seller.sold,
            description:
                "Direct-from-farm specialty coffee from verified Philippine growers and cooperatives.",
            longDescription:
                "Sourced through KapeKonek's traceable supply chain, this lot is processed and dried at origin, then shipped within the harvest window. Each bag preserves the terroir of its highland farm — sweet, balanced, and clean in the cup.",
        });
    }
    return out;
}

export const PRODUCTS = buildProducts();

export function getProduct(id) {
    return PRODUCTS.find((p) => p.id === id);
}
