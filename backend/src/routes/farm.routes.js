import express from "express";
import {
    getFarmsHandler,
    getFarmFarmersHandler,
    createFarmHandler,
    updateFarmHandler,
    deleteFarmHandler,
    leaveFarmHandler,
} from "../controllers/farm.controller.js";
import {
    validateGetFarmsQuery,
    validateCreateFarm,
    validateUpdateFarm,
    validateFarmIdParam,
} from "../validators/farm.validator.js";
import {
    authenticated,
    allowRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
    "/",
    authenticated,
    allowRoles("kaluppa", "manager", "farmer", "dti"),
    validateGetFarmsQuery,
    getFarmsHandler,
);
router.get(
    "/:id/farmers",
    authenticated,
    allowRoles("kaluppa", "manager"),
    validateFarmIdParam,
    getFarmFarmersHandler,
);
router.post(
    "/",
    authenticated,
    allowRoles("kaluppa", "manager", "farmer"),
    validateCreateFarm,
    createFarmHandler,
);
router.post(
    "/:id/leave",
    authenticated,
    allowRoles("farmer"),
    validateFarmIdParam,
    leaveFarmHandler,
);
router.patch(
    "/:id",
    authenticated,
    allowRoles("kaluppa", "manager", "farmer"),
    validateFarmIdParam,
    validateUpdateFarm,
    updateFarmHandler,
);
router.delete(
    "/:id",
    authenticated,
    allowRoles("kaluppa", "manager", "farmer"),
    validateFarmIdParam,
    deleteFarmHandler,
);

export default router;
