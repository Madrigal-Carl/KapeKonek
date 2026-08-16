import express from "express";
import {
    getAssociationsHandler,
    getAssociationFarmersHandler,
} from "../controllers/association.controller.js";
import { validateAssociationIdParam } from "../validators/association.validator.js";
import {
    authenticated,
    allowRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
    "/",
    authenticated,
    allowRoles("kaluppa"),
    getAssociationsHandler,
);
router.get(
    "/:id/farmers",
    authenticated,
    allowRoles("kaluppa", "manager"),
    validateAssociationIdParam,
    getAssociationFarmersHandler,
);

export default router;
