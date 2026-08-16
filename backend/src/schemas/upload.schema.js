import { z } from "zod";

export const uploadSignatureSchema = z.object({
    type: z.enum(["farmer", "report", "chat", "post", "product"], {
        error: "Upload type is required",
        invalid_type_error:
            "Type must be either 'farmer', 'report', 'chat', 'post', or 'product'",
    }),
    fileName: z.string().trim().min(1, "File name is required").optional(),
});