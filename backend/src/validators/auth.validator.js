import { loginSchema, registerSchema } from "../schemas/auth.schema.js";

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

export const validateLogin = validate(loginSchema);
export const validateRegister = validate(registerSchema);