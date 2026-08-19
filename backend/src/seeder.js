import "./config/env.js";
import mongoose from "mongoose";

import { wipeAssociations, seedAssociations } from "./seeders/association.seeder.js";
import { wipeUsers, seedUsers } from "./seeders/user.seeder.js";
import { wipeFarmerVerifications, seedFarmerVerifications } from "./seeders/farmerVerification.seeder.js";
import { wipeFarms, seedFarms } from "./seeders/farm.seeder.js";
import { wipeHarvests, seedHarvests } from "./seeders/harvest.seeder.js";
import { wipeProducts, seedProducts } from "./seeders/product.seeder.js";

// Models with no seed data yet — still wiped so every collection starts clean.
import Order from "./models/order.model.js";
import Post from "./models/post.model.js";
import Comment from "./models/comment.model.js";
import Like from "./models/like.model.js";
import Rating from "./models/rating.model.js";
import ChatMessage from "./models/chatMessage.model.js";
import ChatRead from "./models/chatRead.model.js";
import CoffeeBean from "./models/coffeeBean.model.js";

const WIPE_ONLY_MODELS = [
    Order,
    Post,
    Comment,
    Like,
    Rating,
    ChatMessage,
    ChatRead,
    CoffeeBean,
];

// Order matters: each entry is listed after every seeder whose output it
// depends on, so foreign keys always point at documents that already exist
// by the time they're referenced.
//
//   Users               -> no dependencies
//   Associations        -> needs Users (each association is owned by a
//                          seeded manager)
//   FarmerVerifications -> needs Users + Associations (farmers are linked
//                          to their association, rosters populated)
//   Farms               -> needs Users + Associations (owner + association +
//                          assigned farmer roster resolved from them)
//   Harvests            -> needs Farms + Users (each harvest points at a
//                          farm, one of its farmers, and the farm's
//                          association)
//   Products            -> needs Users + Farms (farmer/kaluppa owners and the
//                          farm each product belongs to)
//
// To add a new model seeder later: create seeders/xxx.seeder.js exporting
// wipeXxx()/seedXxx(context), import it above, and add one entry below in
// the right spot relative to what it depends on.
const SEEDERS = [
    { name: "Users", wipe: wipeUsers, seed: seedUsers },
    { name: "Associations", wipe: wipeAssociations, seed: seedAssociations },
    { name: "Farmer Verifications", wipe: wipeFarmerVerifications, seed: seedFarmerVerifications },
    { name: "Farms", wipe: wipeFarms, seed: seedFarms },
    { name: "Harvests", wipe: wipeHarvests, seed: seedHarvests },
    { name: "Products", wipe: wipeProducts, seed: seedProducts },
];

async function runSeeders() {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error("MONGO_URI is not set in your environment/.env file");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB\n");

    console.log("Wiping existing data...");
    for (const seeder of [...SEEDERS].reverse()) {
        console.log(`- ${seeder.name}`);
        await seeder.wipe();
    }
    for (const model of WIPE_ONLY_MODELS) {
        const result = await model.deleteMany({});
        console.log(`- ${model.modelName} (wiped ${result.deletedCount})`);
    }
    console.log("");

    console.log("Seeding fresh data...");
    let context = {};
    for (const seeder of SEEDERS) {
        console.log(`--- ${seeder.name} ---`);
        const result = await seeder.seed(context);
        context = { ...context, ...result };
        console.log("");
    }

    console.log("All seeders completed.");
    await mongoose.disconnect();
}

runSeeders()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Seeding failed:", err);
        process.exit(1);
    });
