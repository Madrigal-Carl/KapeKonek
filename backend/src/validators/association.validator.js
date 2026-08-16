import { associationIdParamSchema } from "../schemas/association.schema.js";

export const validateAssociationIdParam = (req, res, next) => {
    const result = associationIdParamSchema.safeParse(req.params);

    if (!result.success) {
        return res.status(400).json({
            message: "Validation error",
            errors: result.error.issues,
        });
    }

    req.params = result.data;
    next();
};
