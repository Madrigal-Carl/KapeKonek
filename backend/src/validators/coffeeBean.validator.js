import {
    createCoffeeBeanSchema,
    updateCoffeeBeanSchema,
    coffeeBeanIdParamSchema,
    getCoffeeBeansQuerySchema,
    updateCoffeeBeanPriceSchema,
} from "../schemas/coffeeBean.schema.js";

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

const validateQuery = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
        return res.status(400).json({
            message: "Validation error",
            errors: result.error.issues,
        });
    }

    Object.defineProperty(req, "query", {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
    });

    next();
};

export const validateCreateCoffeeBean = validate(createCoffeeBeanSchema);
export const validateUpdateCoffeeBean = validate(updateCoffeeBeanSchema);
export const validateUpdateCoffeeBeanPrice = validate(updateCoffeeBeanPriceSchema);
export const validateCoffeeBeanIdParam = validateParams(coffeeBeanIdParamSchema);
export const validateGetCoffeeBeansQuery = validateQuery(getCoffeeBeansQuerySchema);
