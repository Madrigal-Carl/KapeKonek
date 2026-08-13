import { z } from "zod";

export const HARVEST_VARIETIES = ["arabica", "robusta", "liberica", "excelsa"];

const objectId = (label) =>
    z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}`);

const emptyToUndefined = (val) => (val === "" || val === null ? undefined : val);

const variety = z.enum(HARVEST_VARIETIES, { error: "Variety is required" });

const yieldKg = z.preprocess(
    emptyToUndefined,
    z.coerce
        .number({ error: "Yield is required" })
        .min(0, "Yield must not be negative"),
);

const harvestedAt = z.preprocess(
    emptyToUndefined,
    z.coerce.date().optional(),
);

export const createHarvestSchema = z.object({
    farm: objectId("farm id"),
    variety,
    yieldKg,
    harvestedAt,
    // Required for manager/kaluppa — resolved from the authenticated
    // farmer's account for the farmer role.
    farmer: objectId("farmer id").optional(),
});

export const updateHarvestSchema = z
    .object({
        farm: objectId("farm id").optional(),
        variety: variety.optional(),
        yieldKg: yieldKg.optional(),
        harvestedAt: harvestedAt.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    });

export const harvestIdParamSchema = z.object({
    id: objectId("harvest id"),
});

export const getHarvestsQuerySchema = z.object({
    all: z
        .enum(["true", "false"])
        .optional()
        .transform((value) => value === "true"),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().optional().default(10),
    variety: z
        .string()
        .optional()
        .transform((value) =>
            value
                ? value
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean)
                : undefined,
        ),
});
