import mongoose from "mongoose";

const farmSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
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
            min: 0,
        },
        propertyNumber: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },
        latitude: {
            type: Number,
            required: true,
            min: -90,
            max: 90,
        },
        longitude: {
            type: Number,
            required: true,
            min: -180,
            max: 180,
        },
        assignedFarmers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
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

farmSchema.index(
    { propertyNumber: 1 },
    {
        unique: true,
        // Ignore stale/legacy docs without a property number so index
        // creation doesn't fail, and only enforce uniqueness where a
        // property number actually exists.
        partialFilterExpression: { propertyNumber: { $exists: true } },
    },
);

export default mongoose.model("Farm", farmSchema);
