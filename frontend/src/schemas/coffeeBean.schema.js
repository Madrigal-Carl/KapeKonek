import { z } from "zod";

export const COFFEE_BEAN_VARIETIES = [
    "arabica",
    "robusta",
    "liberica",
    "excelsa",
];

export const COFFEE_BEAN_VARIETY_OPTIONS = COFFEE_BEAN_VARIETIES.map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
}));

export const COFFEE_BEAN_STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

const objectId = (label) =>
    z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}`);

const variety = z.enum(COFFEE_BEAN_VARIETIES, {
    error: "Variety is required",
});

const status = z.enum(["active", "inactive"]).optional();

const weight = z.coerce
    .number("Weight must be a number")
    .positive("Weight must be greater than 0");

const price = z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce
        .number("Price must be a number")
        .nonnegative("Price must not be negative")
        .refine(
            (value) => value === undefined || Number.isInteger(Math.round(value * 100)),
            { message: "Price must have at most 2 decimal places" },
        )
        .optional(),
);

const description = z
    .string()
    .trim()
    .max(2000, "Description must not exceed 2000 characters")
    .optional();

const imageItem = z.object({
    url: z
        .string()
        .url("Invalid image URL")
        .regex(/\.(jpe?g|png)$/i, "Image must be JPG, JPEG, or PNG"),
    isPrimary: z.boolean().optional(),
});

const imageUrls = z
    .array(imageItem)
    .max(10, "A bean record can have at most 10 images")
    .optional();

export const createCoffeeBeanSchema = z.object({
    variety,
    weight,
    status,
    description,
    imageUrls,
    // Required for managers — resolved server-side for farmers.
    owner: objectId("owner id").optional(),
});

export const updateCoffeeBeanSchema = z
    .object({
        variety: variety.optional(),
        weight: weight.optional(),
        status: status.optional(),
        description: description.optional(),
        imageUrls: imageUrls.optional(),
        owner: objectId("owner id").optional(),
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
