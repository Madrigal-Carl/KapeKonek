import {
    createOrder,
    getMyOrders,
    cancelOrder,
} from "../services/order.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createOrderHandler = asyncHandler(async (req, res) => {
    const order = await createOrder(req.body, req.user);

    return res.status(201).json({
        message: "Order placed successfully",
        order,
    });
});

export const getMyOrdersHandler = asyncHandler(async (req, res) => {
    const orders = await getMyOrders(req.user);

    return res.status(200).json({
        message: "Orders fetched successfully",
        orders,
    });
});

export const cancelOrderHandler = asyncHandler(async (req, res) => {
    const order = await cancelOrder(req.params.id, req.user);

    return res.status(200).json({
        message: "Order cancelled successfully",
        order,
    });
});
