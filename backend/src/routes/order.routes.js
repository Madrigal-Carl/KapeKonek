import express from "express";
import {
    createOrderHandler,
    getMyOrdersHandler,
    cancelOrderHandler,
} from "../controllers/order.controller.js";
import {
    validateCreateOrder,
    validateOrderIdParam,
} from "../validators/order.validator.js";
import {
    authenticated,
    allowRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticated, getMyOrdersHandler);
router.post(
    "/",
    authenticated,
    allowRoles("buyer", "farmer", "kaluppa"),
    validateCreateOrder,
    createOrderHandler,
);
router.patch(
    "/:id/cancel",
    authenticated,
    validateOrderIdParam,
    cancelOrderHandler,
);

export default router;
