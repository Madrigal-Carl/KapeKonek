import mongoose from "mongoose";

const farmSchema = new mongoose.Schema(
    {
        association: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Association",
            required: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        size: {
            type: Number,
            required: true,
        },
        propertyNumber: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
        assignedFarmers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    },
);

export default mongoose.model("Farm", farmSchema);