import express from "express";
import {
    getHarvestsHandler,
    createHarvestHandler,
    updateHarvestHandler,
    deleteHarvestHandler,
} from "../controllers/harvest.controller.js";
import {
    validateGetHarvestsQuery,
    validateCreateHarvest,
    validateUpdateHarvest,
    validateHarvestIdParam,
} from "../validators/harvest.validator.js";
import {
    authenticated,
    allowRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
    "/",
    authenticated,
    allowRoles("kaluppa", "manager", "farmer", "dti"),
    validateGetHarvestsQuery,
    getHarvestsHandler,
);
router.post(
    "/",
    authenticated,
    allowRoles("kaluppa", "manager", "farmer"),
    validateCreateHarvest,
    createHarvestHandler,
);
router.patch(
    "/:id",
    authenticated,
    allowRoles("kaluppa", "manager", "farmer"),
    validateHarvestIdParam,
    validateUpdateHarvest,
    updateHarvestHandler,
);
router.delete(
    "/:id",
    authenticated,
    allowRoles("kaluppa", "manager", "farmer"),
    validateHarvestIdParam,
    deleteHarvestHandler,
);

export default router;
