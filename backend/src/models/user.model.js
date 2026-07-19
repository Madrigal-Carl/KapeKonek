import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        lastName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },
        middleName: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        contactNumber: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            minlength: 6,
            select: false,
        },
        isVerified: {
            type: Boolean,
            default: true,
        },
        role: {
            type: String,
            enum: ["buyer", "farmer", "manager", "dti", "kaluppa"],
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model("User", userSchema);