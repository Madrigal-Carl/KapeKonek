import express from "express";
import {
    getFarmsHandler,
    getJoinableFarmsHandler,
    createFarmHandler,
    updateFarmHandler,
    deleteFarmHandler,
    joinFarmHandler,
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
    allowRoles("kaluppa", "manager", "farmer"),
    validateGetFarmsQuery,
    getFarmsHandler,
);
router.get(
    "/joinable",
    authenticated,
    allowRoles("farmer"),
    getJoinableFarmsHandler,
);
router.post(
    "/",
    authenticated,
    allowRoles("kaluppa", "manager", "farmer"),
    validateCreateFarm,
    createFarmHandler,
);
router.post(
    "/:id/join",
    authenticated,
    allowRoles("farmer"),
    validateFarmIdParam,
    joinFarmHandler,
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
