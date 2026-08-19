import { z } from "zod";

const objectId = (label) =>
    z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}`);

const variety = z.enum(
    ["arabica", "robusta", "liberica", "excelsa"],
    { error: "Variety is required" },
);

const status = z.enum(["active", "inactive"]).optional();

const weight = z.coerce
    .number("Weight must be a number")
    .positive("Weight must be greater than 0");

const price = z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce
        .number("Price must be a number")
        .nonnegative("Price must not be negative")
        .refine(
            (value) => value === undefined || Number.isInteger(value * 100),
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
    // Required for managers — resolved from authenticated user for farmers
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

export const updateCoffeeBeanPriceSchema = z.object({
    price: z.coerce
        .number("Price must be a number")
        .nonnegative("Price must not be negative")
        .refine(
            (value) => Number.isInteger(value * 100),
            { message: "Price must have at most 2 decimal places" },
        ),
});

export const coffeeBeanIdParamSchema = z.object({
    id: objectId("coffee bean id"),
});

export const getCoffeeBeansQuerySchema = z.object({
    all: z
        .enum(["true", "false"])
        .optional()
        .transform((value) => value === "true"),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().optional().default(10),
    status: z.enum(["active", "inactive"]).optional(),
    variety: z
        .enum(["arabica", "robusta", "liberica", "excelsa"])
        .optional(),
    search: z
        .string()
        .trim()
        .max(200, "Search must not exceed 200 characters")
        .optional(),
});
