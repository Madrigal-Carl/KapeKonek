import express from "express";
import {
    getProductsHandler,
    createProductHandler,
    updateProductHandler,
    deleteProductHandler,
} from "../controllers/product.controller.js";
import {
    validateGetProductsQuery,
    validateCreateProduct,
    validateUpdateProduct,
    validateProductIdParam,
} from "../validators/product.validator.js";
import {
    authenticated,
    allowRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
    "/",
    authenticated,
    allowRoles("kaluppa", "manager", "farmer", "dti"),
    validateGetProductsQuery,
    getProductsHandler,
);
router.post(
    "/",
    authenticated,
    allowRoles("kaluppa", "manager", "farmer"),
    validateCreateProduct,
    createProductHandler,
);
router.patch(
    "/:id",
    authenticated,
    allowRoles("kaluppa", "manager", "farmer"),
    validateProductIdParam,
    validateUpdateProduct,
    updateProductHandler,
);
router.delete(
    "/:id",
    authenticated,
    allowRoles("kaluppa", "manager", "farmer"),
    validateProductIdParam,
    deleteProductHandler,
);

export default router;
