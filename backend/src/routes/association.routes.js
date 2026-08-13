import express from "express";
import { getAssociationsHandler } from "../controllers/association.controller.js";
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

export default router;
