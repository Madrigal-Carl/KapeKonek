import { z } from "zod";

const objectId = (label) =>
    z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}`);

export const orderIdParamSchema = z.object({
    id: objectId("order id"),
});

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

export const updateOrderStatusSchema = z.object({
    status: z.enum(["pending", "reserved", "completed", "cancelled"]),
    deliveryFee: z.coerce
        .number("Delivery fee must be a number")
        .nonnegative("Delivery fee must not be negative")
        .optional(),
    remarks: z
        .string()
        .trim()
        .max(1000, "Remarks must not exceed 1000 characters")
        .optional(),
});

export const reserveOrderSchema = z.object({
    deliveryFee: z.coerce
        .number("Delivery fee must be a number")
        .nonnegative("Delivery fee must not be negative")
        .optional(),
});

export const cancelOrderSchema = z.object({
    remarks: z
        .string()
        .trim()
        .max(1000, "Remarks must not exceed 1000 characters")
        .optional(),
});

export const getOrdersQuerySchema = z.object({
    all: z
        .enum(["true", "false"])
        .optional()
        .transform((value) => value === "true"),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().optional().default(10),
    status: z.enum(["pending", "reserved", "completed", "cancelled"]).optional(),
    search: z
        .string()
        .trim()
        .max(200, "Search must not exceed 200 characters")
        .optional(),
});
