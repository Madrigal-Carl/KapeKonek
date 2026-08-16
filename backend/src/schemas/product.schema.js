import { z } from "zod";

const objectId = (label) =>
    z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}`);

const name = z
    .string({ error: "Product name is required" })
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name must not exceed 200 characters");

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

const description = z
    .string()
    .trim()
    .max(2000, "Description must not exceed 2000 characters")
    .optional();

const imageItem = z.object({
    url: z.string().url("Invalid image URL"),
    isPrimary: z.boolean().optional(),
});

const imageUrls = z.array(imageItem).max(10, "A product can have at most 10 images").optional();

export const createProductSchema = z.object({
    name,
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
        name: name.optional(),
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
