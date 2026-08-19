import {
    getCoffeeBeans,
    getCoffeeBeanById,
    createCoffeeBean,
    updateCoffeeBean,
    updateCoffeeBeanPrice,
    deleteCoffeeBean,
} from "../services/coffeeBean.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCoffeeBeansHandler = asyncHandler(async (req, res) => {
    const { coffeeBeans, pagination } = await getCoffeeBeans(req.query, req.user);

    return res.status(200).json({
        message: "Coffee beans fetched successfully",
        coffeeBeans,
        pagination,
    });
});

export const getCoffeeBeanDetailHandler = asyncHandler(async (req, res) => {
    const coffeeBean = await getCoffeeBeanById(req.params.id, req.user);

    return res.status(200).json({
        message: "Coffee bean fetched successfully",
        coffeeBean,
    });
});

export const createCoffeeBeanHandler = asyncHandler(async (req, res) => {
    const coffeeBean = await createCoffeeBean(req.body, req.user);

    return res.status(201).json({
        message: "Coffee bean created successfully",
        coffeeBean,
    });
});

export const updateCoffeeBeanHandler = asyncHandler(async (req, res) => {
    const coffeeBean = await updateCoffeeBean(req.params.id, req.body, req.user);

    return res.status(200).json({
        message: "Coffee bean updated successfully",
        coffeeBean,
    });
});

export const updateCoffeeBeanPriceHandler = asyncHandler(async (req, res) => {
    const coffeeBean = await updateCoffeeBeanPrice(
        req.params.id,
        req.body.price,
        req.user,
    );

    return res.status(200).json({
        message: "Coffee bean price updated successfully",
        coffeeBean,
    });
});

export const deleteCoffeeBeanHandler = asyncHandler(async (req, res) => {
    const coffeeBean = await deleteCoffeeBean(req.params.id, req.user);

    return res.status(200).json({
        message: "Coffee bean deleted successfully",
        coffeeBean,
    });
});
