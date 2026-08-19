import express from "express";
import {
    createOrderHandler,
    getMyOrdersHandler,
} from "../controllers/order.controller.js";
import { validateCreateOrder } from "../validators/order.validator.js";
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

export default router;
