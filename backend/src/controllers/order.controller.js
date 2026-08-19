import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    reserveOrder,
    completeOrder,
    cancelOrder,
} from "../services/order.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getOrdersHandler = asyncHandler(async (req, res) => {
    const result = await getOrders(req.query, req.user);

    return res.status(200).json({
        message: "Orders fetched successfully",
        ...result,
    });
});

export const getOrderByIdHandler = asyncHandler(async (req, res) => {
    const order = await getOrderById(req.params.id, req.user);

    return res.status(200).json({
        message: "Order fetched successfully",
        order,
    });
});

export const createOrderHandler = asyncHandler(async (req, res) => {
    const order = await createOrder(req.body, req.user);

    return res.status(201).json({
        message: "Order placed successfully",
        order,
    });
});

export const updateOrderStatusHandler = asyncHandler(async (req, res) => {
    const order = await updateOrderStatus(req.params.id, req.body, req.user);

    return res.status(200).json({
        message: "Order status updated successfully",
        order,
    });
});

export const reserveOrderHandler = asyncHandler(async (req, res) => {
    const order = await reserveOrder(req.params.id, req.body, req.user);

    return res.status(200).json({
        message: "Order reserved successfully",
        order,
    });
});

export const completeOrderHandler = asyncHandler(async (req, res) => {
    const order = await completeOrder(req.params.id, req.user);

    return res.status(200).json({
        message: "Order marked as completed successfully",
        order,
    });
});

export const cancelOrderHandler = asyncHandler(async (req, res) => {
    const order = await cancelOrder(req.params.id, req.body, req.user);

    return res.status(200).json({
        message: "Order cancelled successfully",
        order,
    });
});
