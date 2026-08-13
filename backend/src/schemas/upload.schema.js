import { z } from "zod";

export const uploadSignatureSchema = z.object({
    type: z.enum(["farmer", "report", "chat"], {
        error: "Upload type is required",
        invalid_type_error: "Type must be either 'farmer', 'report', or 'chat'",
    }),
    fileName: z.string().trim().min(1, "File name is required").optional(),
});