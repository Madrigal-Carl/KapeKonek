import { z } from "zod";

export const PRODUCT_CATEGORIES = [
    "coffee_seedlings",
    "coffee_cherries",
    "fertilizer",
    "coffee_beans",
];

export const PRODUCT_VARIETIES = ["arabica", "robusta", "liberica", "excelsa"];

export const PRODUCT_CATEGORY_OPTIONS = PRODUCT_CATEGORIES.map((value) => ({
    value,
    label: value
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
}));

export const PRODUCT_VARIETY_OPTIONS = PRODUCT_VARIETIES.map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
}));

export const PRODUCT_STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

const objectId = (label) =>
    z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}`);

const category = z.enum(PRODUCT_CATEGORIES, { error: "Category is required" });

const variety = z.enum(PRODUCT_VARIETIES, { error: "Variety is required" });

const stock = z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce
        .number()
        .int("Stock must be a whole number")
        .min(0, "Stock must not be negative")
        .optional(),
);

const status = z.enum(["active", "inactive"]).optional();

const weight = z.coerce
    .number()
    .nonnegative("Weight must not be negative")
    .optional();

const description = z
    .string()
    .trim()
    .max(2000, "Description must not exceed 2000 characters")
    .optional();

const imageItem = z.object({
    url: z.string().url("Invalid image URL"),
    isPrimary: z.boolean().optional(),
});

const imageUrls = z
    .array(imageItem)
    .max(10, "A product can have at most 10 images")
    .optional();

export const createProductSchema = z.object({
    farm: objectId("farm id"),
    category,
    variety,
    stock,
    status,
    weight,
    description,
    imageUrls,
    // Required for managers — resolved server-side for farmers/kaluppa.
    owner: objectId("owner id").optional(),
});

export const updateProductSchema = z
    .object({
        farm: objectId("farm id").optional(),
        category: category.optional(),
        variety: variety.optional(),
        stock: stock.optional(),
        status: status.optional(),
        weight: weight.optional(),
        description: description.optional(),
        imageUrls: imageUrls.optional(),
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
