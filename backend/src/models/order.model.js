import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        referenceNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        paymentMethod: {
            type: String,
            enum: ["cash", "e-wallet"],
            required: true,
        },
        deliveryMethod: {
            type: String,
            enum: ["delivery", "pickup"],
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        deliveryFee: {
            type: Number,
            default: null,
        },
        status: {
            type: String,
            enum: ["pending", "reserved", "cancelled", "completed"],
            default: "pending",
            required: true,
        },
        orderedProducts: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                    trim: true,
                },
                price: {
                    type: Number,
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
            },
        ],
        receipts: [
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

export default mongoose.model("Order", orderSchema);