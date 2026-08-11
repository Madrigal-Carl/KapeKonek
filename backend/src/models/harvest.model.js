import mongoose from "mongoose";

const harvestSchema = new mongoose.Schema(
    {
        association: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Association",
            required: true,
        },
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
        yield: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model("Harvest", harvestSchema);