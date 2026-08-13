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

// Auto-generates the property number in TCT-<year>-<increment> format when a
// farm is created without one. Runs before validation so the required field
// passes, and skips farms that already carry an explicit number (seeders).
farmSchema.pre("validate", async function () {
    if (this.propertyNumber) return;

    const year = new Date().getFullYear();
    const prefix = `TCT-${year}-`;

    const last = await Farm.findOne({
        propertyNumber: new RegExp(`^${escapeRegex(prefix)}`),
    })
        .sort({ propertyNumber: -1 })
        .select("propertyNumber");

    const lastNumber = last
        ? Number(last.propertyNumber.slice(prefix.length)) || 0
        : 0;

    this.propertyNumber = `${prefix}${String(lastNumber + 1).padStart(4, "0")}`;
});

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

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const Farm = mongoose.model("Farm", farmSchema);

export default Farm;
