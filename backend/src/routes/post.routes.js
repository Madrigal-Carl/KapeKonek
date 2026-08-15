import express from "express";
import {
    getPostsHandler,
    createPostHandler,
    updatePostHandler,
    deletePostHandler,
    toggleLikeHandler,
    getCommentsHandler,
    createCommentHandler,
    updateCommentHandler,
    deleteCommentHandler,
} from "../controllers/post.controller.js";
import {
    validateGetPostsQuery,
    validateCreatePost,
    validateUpdatePost,
    validatePostIdParam,
    validateGetCommentsQuery,
    validateCreateComment,
    validateUpdateComment,
    validateCommentIdParam,
} from "../validators/post.validator.js";
import {
    authenticated,
    allowRoles,
} from "../middlewares/auth.middleware.js";

// Everyone except buyers can read and write posts.
const POST_ROLES = ["farmer", "manager", "dti", "kaluppa"];

const router = express.Router();

router.get(
    "/",
    authenticated,
    allowRoles(...POST_ROLES),
    validateGetPostsQuery,
    getPostsHandler,
);
router.post(
    "/",
    authenticated,
    allowRoles(...POST_ROLES),
    validateCreatePost,
    createPostHandler,
);
router.patch(
    "/:id",
    authenticated,
    allowRoles(...POST_ROLES),
    validatePostIdParam,
    validateUpdatePost,
    updatePostHandler,
);
router.delete(
    "/:id",
    authenticated,
    allowRoles(...POST_ROLES),
    validatePostIdParam,
    deletePostHandler,
);
router.post(
    "/:id/like",
    authenticated,
    allowRoles(...POST_ROLES),
    validatePostIdParam,
    toggleLikeHandler,
);
router.get(
    "/:id/comments",
    authenticated,
    allowRoles(...POST_ROLES),
    validatePostIdParam,
    validateGetCommentsQuery,
    getCommentsHandler,
);
router.post(
    "/:id/comments",
    authenticated,
    allowRoles(...POST_ROLES),
    validatePostIdParam,
    validateCreateComment,
    createCommentHandler,
);
router.patch(
    "/:id/comments/:commentId",
    authenticated,
    allowRoles(...POST_ROLES),
    validateCommentIdParam,
    validateUpdateComment,
    updateCommentHandler,
);
router.delete(
    "/:id/comments/:commentId",
    authenticated,
    allowRoles(...POST_ROLES),
    validateCommentIdParam,
    deleteCommentHandler,
);

export default router;
