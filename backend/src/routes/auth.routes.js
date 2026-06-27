import express from "express";
import {
    register,
    verifyEmail,
    login,
    logout,
    getMe,
} from "../controllers/auth.controller.js";
import {
    validateLogin,
    validateRegister,
} from "../validators/auth.validator.js";
import { authenticated, guestOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", guestOnly, validateRegister, register);

router.get("/verify-email/:token", guestOnly, verifyEmail);

router.post("/login", guestOnly, validateLogin, login);

router.post("/logout", authenticated, logout);

router.get("/me", authenticated, getMe);

export default router;