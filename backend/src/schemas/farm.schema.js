import { z } from "zod";

const objectId = (label) =>
    z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}`);

const emptyToUndefined = (val) => (val === "" || val === null ? undefined : val);

const size = z.preprocess(
    emptyToUndefined,
    z.coerce
        .number({ error: "Size is required" })
        .min(0, "Size must not be negative"),
);

const latitude = z.preprocess(
    emptyToUndefined,
    z.coerce
        .number({ error: "Latitude is required" })
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90"),
);

const longitude = z.preprocess(
    emptyToUndefined,
    z.coerce
        .number({ error: "Longitude is required" })
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180"),
);

const address = z
    .string({ error: "Address is required" })
    .trim()
    .min(2, "Address must be at least 2 characters")
    .max(255, "Address must not exceed 255 characters");

const association = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid association id")
    .optional();

const assignedFarmers = z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid farmer id"))
    .optional();

export const createFarmSchema = z.object({
    address,
    size,
    latitude,
    longitude,
    association,
    assignedFarmers,
});

export const updateFarmSchema = z
    .object({
        address: address.optional(),
        size: size.optional(),
        latitude: latitude.optional(),
        longitude: longitude.optional(),
        association,
        assignedFarmers,
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    });

export const farmIdParamSchema = z.object({
    id: objectId("farm id"),
});

export const getFarmsQuerySchema = z.object({
    all: z
        .enum(["true", "false"])
        .optional()
        .transform((value) => value === "true"),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().optional().default(10),
    minSize: z.coerce.number().nonnegative("Min size must not be negative").optional(),
    maxSize: z.coerce.number().nonnegative("Max size must not be negative").optional(),
});
