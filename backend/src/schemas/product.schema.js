import { z } from "zod";

const objectId = (label) =>
    z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}`);

const category = z.enum(
    ["coffee_seedlings", "coffee_cherries", "fertilizer", "coffee_beans"],
    { error: "Category is required" },
);

const variety = z.enum(
    ["arabica", "robusta", "liberica", "excelsa"],
    { error: "Variety is required" },
);

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

const price = z.coerce
    .number("Price must be a number")
    .nonnegative("Price must not be negative")
    .refine(
        (value) => value === undefined || Number.isInteger(value * 100),
        { message: "Price must have at most 2 decimal places" },
    )
    .optional();

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

const imageUrls = z.array(imageItem).max(10, "A product can have at most 10 images").optional();

export const createProductSchema = z.object({
    farm: objectId("farm id"),
    category,
    variety,
    stock,
    status,
    weight,
    description,
    imageUrls,
    // Required for managers — resolved from the authenticated account for
    // farmers and kaluppa.
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

export const productIdParamSchema = z.object({
    id: objectId("product id"),
});

export const createReviewSchema = z.object({
    rating: z.coerce
        .number("Rating is required")
        .int("Rating must be a whole number")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating must be at most 5"),
    message: z
        .string()
        .trim()
        .max(2000, "Review must not exceed 2000 characters")
        .optional(),
});

export const updateProductPriceSchema = z.object({
    price: price.refine((value) => value !== undefined, {
        message: "Price is required",
    }),
});

export const getProductsQuerySchema = z.object({
    all: z
        .enum(["true", "false"])
        .optional()
        .transform((value) => value === "true"),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().optional().default(10),
    status: z.enum(["active", "inactive"]).optional(),
    category: z
        .enum(["coffee_seedlings", "coffee_cherries", "fertilizer", "coffee_beans"])
        .optional(),
    search: z
        .string()
        .trim()
        .max(200, "Search must not exceed 200 characters")
        .optional(),
});
