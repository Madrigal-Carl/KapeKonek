import mongoose from "mongoose";

const farmerVerificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        association: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Association",
        },
        accountStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        associationStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        denyRemarks: {
            type: String,
            default: "",
        },
        associationDenyRemarks: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model("FarmerVerification", farmerVerificationSchema);