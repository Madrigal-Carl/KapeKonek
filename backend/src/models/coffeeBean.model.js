import mongoose from "mongoose";

const coffeeBeanSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        variety: {
            type: String,
            enum: ["arabica", "robusta", "liberica", "excelsa"],
            required: true,
        },
        weight: {
            type: Number,
            required: true,
            min: 0,
        },
        price: {
            type: Number,
            default: null,
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

export default mongoose.model("CoffeeBean", coffeeBeanSchema);
