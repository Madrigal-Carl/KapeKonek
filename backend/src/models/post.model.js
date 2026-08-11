import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        description: {
            type: String,
            trim: true,
        },
        tags: [
            {
                type: String,
                trim: true,
                enum: ["pruning", "harvesting", "processing", "soil", "advisory", "announcement"],
            },
        ],
        imageUrl: [
            {
                type: String,
                trim: true,
            },
        ],
        mediaUrl: [
            {
                type: String,
                trim: true,
            },
        ],
    },
    {
        timestamps: true,
    },
);

export default mongoose.model("Post", postSchema);