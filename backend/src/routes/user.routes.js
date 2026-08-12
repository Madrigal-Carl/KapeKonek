import express from "express";
import {
    getUsersHandler,
    getAvailableFarmersHandler,
    createUserHandler,
    updateUserHandler,
    deleteUserHandler,
    reviewAccountHandler,
    reviewAssociationHandler,
} from "../controllers/user.controller.js";
import {
    validateGetUsersQuery,
    validateCreateUser,
    validateUpdateUser,
    validateReviewAccount,
    validateReviewAssociation,
    validateUserIdParam,
} from "../validators/user.validator.js";
import {
    authenticated,
    allowRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
    "/",
    authenticated,
    allowRoles("kaluppa", "manager", "dti"),
    validateGetUsersQuery,
    getUsersHandler,
);
router.get(
    "/available-farmers",
    authenticated,
    allowRoles("kaluppa"),
    getAvailableFarmersHandler,
);
router.post(
    "/",
    authenticated,
    allowRoles("kaluppa", "manager"),
    validateCreateUser,
    createUserHandler,
);
router.patch(
    "/:id",
    authenticated,
    allowRoles("kaluppa", "manager"),
    validateUserIdParam,
    validateUpdateUser,
    updateUserHandler,
);
router.patch(
    "/:id/review-account",
    authenticated,
    allowRoles("kaluppa", "dti"),
    validateUserIdParam,
    validateReviewAccount,
    reviewAccountHandler,
);
router.patch(
    "/:id/review-association",
    authenticated,
    allowRoles("manager"),
    validateUserIdParam,
    validateReviewAssociation,
    reviewAssociationHandler,
);
router.delete(
    "/:id",
    authenticated,
    allowRoles("kaluppa", "manager"),
    validateUserIdParam,
    deleteUserHandler,
);

export default router;
