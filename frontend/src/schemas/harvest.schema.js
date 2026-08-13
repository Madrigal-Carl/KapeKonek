import { z } from "zod";

export const HARVEST_VARIETIES = ["arabica", "robusta", "liberica", "excelsa"];

export const HARVEST_VARIETY_OPTIONS = HARVEST_VARIETIES.map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
}));

const emptyToUndefined = (val) =>
    val === "" || val === null || val === undefined ? undefined : val;

const objectId = (label) =>
    z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}`);

const variety = z.enum(HARVEST_VARIETIES, { error: "Variety is required" });

const yieldKg = z.preprocess(
    emptyToUndefined,
    z.coerce
        .number({ error: "Yield is required" })
        .min(0, "Yield must not be negative"),
);

const harvestedAt = z
    .preprocess(emptyToUndefined, z.coerce.date().optional())
    .refine(
        (date) => !date || date.getTime() <= Date.now(),
        "Harvest date cannot be in the future",
    );

export const createHarvestSchema = z.object({
    farm: objectId("farm id"),
    variety,
    yieldKg,
    harvestedAt,
    // Farmer is resolved server-side for the farmer role; manager/kaluppa
    // must provide it but that is enforced by the backend, not here.
    farmer: objectId("farmer id").optional(),
});

export const updateHarvestSchema = z
    .object({
        farm: objectId("farm id").optional(),
        variety: variety.optional(),
        yieldKg: yieldKg.optional(),
        harvestedAt: harvestedAt.optional(),
        farmer: objectId("farmer id").optional(),
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
