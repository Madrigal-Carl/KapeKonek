import { z } from "zod";

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
        .number({ error: "Please drop a pin on the map" })
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90"),
);

const longitude = z.preprocess(
    emptyToUndefined,
    z.coerce
        .number({ error: "Please drop a pin on the map" })
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180"),
);

const address = z
    .string({ error: "Address is required" })
    .trim()
    .min(2, "Address must be at least 2 characters")
    .max(255, "Address must not exceed 255 characters");

const propertyNumber = z
    .string({ error: "Property number is required" })
    .trim()
    .min(2, "Property number must be at least 2 characters")
    .max(100, "Property number must not exceed 100 characters");

const association = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid association id")
    .optional();

const associationRequired = z
    .string({ error: "Please select an association for the farm" })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid association id");

const assignedFarmers = z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid farmer id"))
    .optional();

export const createFarmSchema = z.object({
    propertyNumber,
    address,
    size,
    latitude,
    longitude,
    association,
    assignedFarmers,
});

export const createKaluppaFarmSchema = createFarmSchema.extend({
    association: associationRequired,
});

export const updateFarmSchema = z
    .object({
        propertyNumber: propertyNumber.optional(),
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

export const getFieldErrors = (error) => {
    const errors = {};

    for (const issue of error.issues) {
        const field = issue.path[0] ?? "form";
        if (!errors[field]) errors[field] = issue.message;
    }

    return errors;
};
