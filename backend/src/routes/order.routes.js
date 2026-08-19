import express from "express";
import {
    createOrderHandler,
    getOrdersHandler,
    getOrderByIdHandler,
    updateOrderStatusHandler,
    reserveOrderHandler,
    completeOrderHandler,
    cancelOrderHandler,
} from "../controllers/order.controller.js";
import {
    validateCreateOrder,
    validateUpdateOrderStatus,
    validateReserveOrder,
    validateCancelOrder,
    validateOrderIdParam,
    validateGetOrdersQuery,
} from "../validators/order.validator.js";
import {
    authenticated,
    allowRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
    "/",
    authenticated,
    validateGetOrdersQuery,
    getOrdersHandler,
);

router.get(
    "/:id",
    authenticated,
    validateOrderIdParam,
    getOrderByIdHandler,
);

router.post(
    "/",
    authenticated,
    allowRoles("buyer", "farmer", "kaluppa"),
    validateCreateOrder,
    createOrderHandler,
);

router.patch(
    "/:id/status",
    authenticated,
    allowRoles("kaluppa"),
    validateOrderIdParam,
    validateUpdateOrderStatus,
    updateOrderStatusHandler,
);

router.patch(
    "/:id/reserve",
    authenticated,
    allowRoles("kaluppa"),
    validateOrderIdParam,
    validateReserveOrder,
    reserveOrderHandler,
);

router.patch(
    "/:id/complete",
    authenticated,
    allowRoles("kaluppa"),
    validateOrderIdParam,
    completeOrderHandler,
);

router.patch(
    "/:id/cancel",
    authenticated,
    validateOrderIdParam,
    validateCancelOrder,
    cancelOrderHandler,
);

export default router;
