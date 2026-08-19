import { z } from "zod";

const objectId = (label) =>
    z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}`);

export const createOrderSchema = z.object({
    paymentMethod: z.enum(["cash", "e-wallet"]),
    deliveryMethod: z.enum(["delivery", "pickup"]),
    receipts: z
        .array(z.string().url("Invalid receipt URL"))
        .max(5, "A maximum of 5 receipts is allowed")
        .optional(),
    items: z
        .array(
            z.object({
                product: objectId("product id"),
                quantity: z.coerce
                    .number("Quantity is required")
                    .positive("Quantity must be greater than 0"),
            }),
        )
        .min(1, "Order must contain at least one item"),
});
