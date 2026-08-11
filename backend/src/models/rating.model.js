import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        farm: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Farm",
            required: true,
        },
        category: {
            type: String,
            enum: ["coffee_seedlings", "coffee_cherries", "fertilizer", "coffee_beans"],
            required: true,
        },
        variety: {
            type: String,
            enum: ["arabica", "robusta", "liberica", "exceisa"],
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        message: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model("Rating", ratingSchema);