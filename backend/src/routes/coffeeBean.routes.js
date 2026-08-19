import express from "express";
import {
    getCoffeeBeansHandler,
    getCoffeeBeanDetailHandler,
    createCoffeeBeanHandler,
    updateCoffeeBeanHandler,
    updateCoffeeBeanPriceHandler,
    deleteCoffeeBeanHandler,
} from "../controllers/coffeeBean.controller.js";
import {
    validateGetCoffeeBeansQuery,
    validateCreateCoffeeBean,
    validateUpdateCoffeeBean,
    validateUpdateCoffeeBeanPrice,
    validateCoffeeBeanIdParam,
} from "../validators/coffeeBean.validator.js";
import {
    authenticated,
    allowRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
    "/",
    authenticated,
    allowRoles("kaluppa", "manager", "farmer", "dti"),
    validateGetCoffeeBeansQuery,
    getCoffeeBeansHandler,
);

router.get(
    "/:id",
    authenticated,
    allowRoles("kaluppa", "manager", "farmer", "dti"),
    validateCoffeeBeanIdParam,
    getCoffeeBeanDetailHandler,
);

router.post(
    "/",
    authenticated,
    allowRoles("manager", "farmer"),
    validateCreateCoffeeBean,
    createCoffeeBeanHandler,
);

router.patch(
    "/:id",
    authenticated,
    allowRoles("manager", "farmer"),
    validateCoffeeBeanIdParam,
    validateUpdateCoffeeBean,
    updateCoffeeBeanHandler,
);

router.patch(
    "/:id/price",
    authenticated,
    allowRoles("dti"),
    validateCoffeeBeanIdParam,
    validateUpdateCoffeeBeanPrice,
    updateCoffeeBeanPriceHandler,
);

router.delete(
    "/:id",
    authenticated,
    allowRoles("manager", "farmer"),
    validateCoffeeBeanIdParam,
    deleteCoffeeBeanHandler,
);

export default router;
