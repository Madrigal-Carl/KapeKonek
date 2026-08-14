import express from "express";
import {
    getSocketTokenHandler,
    getChatsHandler,
    markChatReadHandler,
    getChatMessagesHandler,
    sendMessageHandler,
    updateMessageHandler,
    deleteMessageHandler,
} from "../controllers/chat.controller.js";
import {
    validateChatIdParam,
    validateMessageIdParam,
    validateGetChatMessagesQuery,
    validateSendMessage,
    validateUpdateMessage,
} from "../validators/chat.validator.js";
import {
    authenticated,
    allowRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
    "/socket-token",
    authenticated,
    allowRoles("manager", "farmer"),
    getSocketTokenHandler,
);
router.get(
    "/",
    authenticated,
    allowRoles("manager", "farmer"),
    getChatsHandler,
);
router.post(
    "/:id/read",
    authenticated,
    allowRoles("manager", "farmer"),
    validateChatIdParam,
    markChatReadHandler,
);
router.get(
    "/:id/messages",
    authenticated,
    allowRoles("manager", "farmer"),
    validateChatIdParam,
    validateGetChatMessagesQuery,
    getChatMessagesHandler,
);
router.post(
    "/:id/messages",
    authenticated,
    allowRoles("manager", "farmer"),
    validateChatIdParam,
    validateSendMessage,
    sendMessageHandler,
);
router.patch(
    "/:id/messages/:messageId",
    authenticated,
    allowRoles("manager", "farmer"),
    validateMessageIdParam,
    validateUpdateMessage,
    updateMessageHandler,
);
router.delete(
    "/:id/messages/:messageId",
    authenticated,
    allowRoles("manager", "farmer"),
    validateMessageIdParam,
    deleteMessageHandler,
);

export default router;
