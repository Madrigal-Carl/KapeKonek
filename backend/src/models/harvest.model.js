import mongoose from "mongoose";

const harvestSchema = new mongoose.Schema(
    {
        farm: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Farm",
            required: true,
        },
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        association: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Association",
            required: true,
        },
        variety: {
            type: String,
            enum: ["arabica", "robusta", "liberica", "excelsa"],
            required: true,
        },
        yieldKg: {
            type: Number,
            required: true,
            min: 0,
        },
        harvestedAt: {
            type: Date,
            default: Date.now,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

harvestSchema.index({ association: 1, harvestedAt: 1 });
harvestSchema.index({ farm: 1, harvestedAt: 1 });
harvestSchema.index({ farmer: 1, harvestedAt: 1 });

export default mongoose.model("Harvest", harvestSchema);
