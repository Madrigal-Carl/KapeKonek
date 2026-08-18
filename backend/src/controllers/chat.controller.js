import jwt from "jsonwebtoken";
import {
    getChats,
    markChatRead,
    getChatMessages,
    sendMessage,
    updateMessage,
    deleteMessage,
    toggleReaction,
} from "../services/chat.service.js";
import { broadcastToChat } from "../websocket/chatSocket.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Mints a short-lived token for the WebSocket handshake — the frontend
// cannot read the httpOnly access cookie, so it fetches this first and
// passes it as the socket handshake auth payload.
export const getSocketTokenHandler = asyncHandler(async (req, res) => {
    const token = jwt.sign(
        { userId: req.user._id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "60s" },
    );

    return res.status(200).json({
        message: "Socket token generated",
        token,
    });
});

export const getChatsHandler = asyncHandler(async (req, res) => {
    const { chats } = await getChats(req.user);

    return res.status(200).json({
        message: "Chats fetched successfully",
        chats,
    });
});

export const markChatReadHandler = asyncHandler(async (req, res) => {
    const { lastReadAt, user } = await markChatRead(req.params.id, req.user);

    broadcastToChat(req.params.id, "chat:read", {
        chatId: req.params.id,
        user,
        lastReadAt,
    });

    return res.status(200).json({
        message: "Chat marked as read",
        lastReadAt,
    });
});

export const getChatMessagesHandler = asyncHandler(async (req, res) => {
    const { messages, pagination } = await getChatMessages(
        req.params.id,
        req.query,
        req.user,
    );

    return res.status(200).json({
        message: "Messages fetched successfully",
        messages,
        pagination,
    });
});

export const sendMessageHandler = asyncHandler(async (req, res) => {
    const message = await sendMessage(req.params.id, req.body, req.user);

    broadcastToChat(req.params.id, "chat:new-message", {
        chatId: req.params.id,
        message,
    });

    return res.status(201).json({
        message: "Message sent successfully",
        message,
    });
});

export const updateMessageHandler = asyncHandler(async (req, res) => {
    const message = await updateMessage(
        req.params.id,
        req.params.messageId,
        req.body,
        req.user,
    );

    broadcastToChat(req.params.id, "chat:message-updated", {
        chatId: req.params.id,
        message,
    });

    return res.status(200).json({
        message: "Message updated successfully",
        message,
    });
});

export const deleteMessageHandler = asyncHandler(async (req, res) => {
    const message = await deleteMessage(
        req.params.id,
        req.params.messageId,
        req.user,
    );

    broadcastToChat(req.params.id, "chat:message-deleted", {
        chatId: req.params.id,
        messageId: req.params.messageId,
        message,
    });

    return res.status(200).json({
        message: "Message deleted successfully",
        message,
    });
});

export const toggleReactionHandler = asyncHandler(async (req, res) => {
    const message = await toggleReaction(
        req.params.id,
        req.params.messageId,
        req.body,
        req.user,
    );

    broadcastToChat(req.params.id, "chat:reaction", {
        chatId: req.params.id,
        messageId: message._id,
        message,
    });

    return res.status(200).json({
        message: "Reaction updated successfully",
        message,
    });
});
