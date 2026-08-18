import express from "express";
import {
    getProductsHandler,
    getCatalogProductsHandler,
    getProductDetailHandler,
    getProductReviewsHandler,
    createProductReviewHandler,
    createProductHandler,
    updateProductHandler,
    updateProductPriceHandler,
    deleteProductHandler,
} from "../controllers/product.controller.js";
import {
    validateGetProductsQuery,
    validateCreateProduct,
    validateUpdateProduct,
    validateUpdateProductPrice,
    validateCreateReview,
    validateProductIdParam,
} from "../validators/product.validator.js";
import {
    authenticated,
    optionalAuth,
    allowRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public-ish catalog — works for guests and any logged-in role. Ownership is
// resolved in the service by who is asking (kaluppa-owned vs farmer-owned).
router.get(
    "/catalog",
    optionalAuth,
    validateGetProductsQuery,
    getCatalogProductsHandler,
);
// Public product detail — guests and any logged-in role.
router.get(
    "/:id",
    optionalAuth,
    validateProductIdParam,
    getProductDetailHandler,
);
// Reviews — viewing is public, reviewing requires a logged-in account.
router.get(
    "/:id/reviews",
    optionalAuth,
    validateProductIdParam,
    getProductReviewsHandler,
);
router.post(
    "/:id/reviews",
    authenticated,
    validateProductIdParam,
    validateCreateReview,
    createProductReviewHandler,
);
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
// DTI is the only role that sets product pricing.
router.patch(
    "/:id/price",
    authenticated,
    allowRoles("dti"),
    validateProductIdParam,
    validateUpdateProductPrice,
    updateProductPriceHandler,
);
router.delete(
    "/:id",
    authenticated,
    allowRoles("kaluppa", "manager", "farmer"),
    validateProductIdParam,
    deleteProductHandler,
);

export default router;
