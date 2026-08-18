import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        url: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["image", "pdf", "document", "video"],
            default: "document",
        },
        size: {
            type: Number,
            default: 0,
        },
    },
    { _id: false },
);

const chatMessageSchema = new mongoose.Schema(
    {
        association: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Association",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: "",
        },
        attachments: [attachmentSchema],
        reactions: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                emoji: {
                    type: String,
                    required: true,
                    trim: true,
                    maxlength: 32,
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

chatMessageSchema.index({ association: 1, createdAt: 1 });

export default mongoose.model("ChatMessage", chatMessageSchema);
