import { z } from "zod";

export const uploadSignatureSchema = z.object({
    type: z.enum(
        ["farmer", "report", "chat", "post", "product", "receipt", "bean", "beans", "coffee_bean"],
        {
            error: "Upload type is required",
            invalid_type_error:
                "Type must be either 'farmer', 'report', 'chat', 'post', 'product', 'receipt', 'bean', 'beans', or 'coffee_bean'",
        },
    ),
    fileName: z.string().trim().min(1, "File name is required").optional(),
});