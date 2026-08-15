import crypto from "crypto";
import cloudinary from "../config/cloudinary.js";

const SUBFOLDER_MAP = {
    farmer: "farmers",
    product: "products",
    receipt: "receipts",
    chat: "chats",
    post: "posts",
};

export const createUploadSignature = ({ type }) => {
    const subfolder = SUBFOLDER_MAP[type];

    if (!subfolder) {
        throw new Error("Invalid upload type");
    }

    const rootFolder = process.env.CLOUDINARY_ROOT_FOLDER;

    if (!rootFolder) {
        throw new Error("CLOUDINARY_ROOT_FOLDER is not configured");
    }

    const folder = `${rootFolder}/${subfolder}`;
    const timestamp = Math.round(Date.now() / 1000);

    // Store the file under a random name — the original filename is kept
    // client-side purely for display, never as the asset's public id.
    const publicId = crypto.randomUUID();

    const paramsToSign = {
        timestamp,
        folder,
        public_id: publicId,
    };

    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET
    );

    return {
        url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
        apiKey: process.env.CLOUDINARY_API_KEY,
        timestamp,
        signature,
        folder,
        publicId,
    };
};