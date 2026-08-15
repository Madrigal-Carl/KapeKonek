import { z } from "zod";

export const uploadSignatureSchema = z.object({
    type: z.enum(["farmer", "report", "chat", "post"], {
        error: "Upload type is required",
        invalid_type_error:
            "Type must be either 'farmer', 'report', 'chat', or 'post'",
    }),
    fileName: z.string().trim().min(1, "File name is required").optional(),
});