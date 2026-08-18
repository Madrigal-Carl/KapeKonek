import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        farm: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Farm",
            required: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        category: {
            type: String,
            enum: ["coffee_seedlings", "coffee_cherries", "fertilizer", "coffee_beans"],
            required: true,
        },
        variety: {
            type: String,
            enum: ["arabica", "robusta", "liberica", "excelsa"],
            required: true,
        },
        stock: {
            type: Number,
            default: null,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        weight: {
            type: Number,
        },
        description: {
            type: String,
            trim: true,
        },
        imageUrls: [
            {
                url: {
                    type: String,
                    trim: true,
                    required: true,
                },
                isPrimary: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model("Product", productSchema);