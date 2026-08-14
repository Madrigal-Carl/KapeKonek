import mongoose from "mongoose";

const chatReadSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        association: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Association",
            required: true,
        },
        lastReadAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

chatReadSchema.index({ user: 1, association: 1 }, { unique: true });

export default mongoose.model("ChatRead", chatReadSchema);
