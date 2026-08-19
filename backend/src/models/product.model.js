import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        category: {
            type: String,
            enum: ["coffee_seedlings", "fertilizer", "coffee_beans"],
            required: true,
        },
        variety: {
            type: String,
            enum: ["arabica", "robusta", "liberica", "excelsa"],
            required: true,
        },
        stock: {
            type: Number,
            default: 0,
            min: 0,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
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