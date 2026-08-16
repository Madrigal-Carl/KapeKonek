import { z } from "zod";

export const associationIdParamSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid association id"),
});
