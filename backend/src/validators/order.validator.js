import {
    createOrderSchema,
    orderIdParamSchema,
} from "../schemas/order.schema.js";

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Validation error",
            errors: result.error.issues,
        });
    }

    req.body = result.data;
    next();
};

const validateParams = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
        return res.status(400).json({
            message: "Validation error",
            errors: result.error.issues,
        });
    }

    req.params = result.data;
    next();
};

export const validateCreateOrder = validate(createOrderSchema);
export const validateOrderIdParam = validateParams(orderIdParamSchema);
