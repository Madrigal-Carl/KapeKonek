import { z } from "zod";

export const PRODUCT_CATEGORIES = [
    "coffee_seedlings",
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

const price = z.coerce
    .number("Price must be a number")
    .nonnegative("Price must not be negative")
    .refine(
        (value) => value === undefined || Number.isInteger(Math.round(value * 100)),
        { message: "Price must have at most 2 decimal places" },
    );

const status = z.enum(["active", "inactive"]).optional();

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
    .max(10, "A product can have at most 10 images")
    .optional();

export const createProductSchema = z.object({
    category,
    variety,
    stock,
    price,
    status,
    description,
    imageUrls,
});

export const updateProductSchema = z
    .object({
        category: category.optional(),
        variety: variety.optional(),
        stock: stock.optional(),
        price: price.optional(),
        status: status.optional(),
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
