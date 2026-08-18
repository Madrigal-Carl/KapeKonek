import { io } from "socket.io-client";
import api from "@/api/axios";

let socket = null;
let activeChatId = null;
const listeners = new Map(); // event -> Set<callback>

// Tracks which chat is currently open in the UI, so unread badges aren't
// incremented for the conversation being viewed.
export const setActiveChatId = (chatId) => {
    activeChatId = chatId;
};

export const getActiveChatId = () => activeChatId;

const getSocketUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
    return apiUrl.replace(/\/+$/, "").replace(/\/api$/, "");
};

const emit = (event, data) => {
    listeners.get(event)?.forEach((callback) => callback(data));
};

// Opens (or returns) the shared Socket.IO connection. The handshake token
// is minted by the backend through a normal credentialed request, since the
// access token itself is httpOnly. Reconnection is built into socket.io.
export const connectChatSocket = async () => {
    if (socket?.connected || socket?.active) return socket;

    try {
        const { data } = await api.get("/chats/socket-token");
        socket = io(getSocketUrl(), {
            auth: { token: data.token },
            reconnection: true,
            reconnectionDelay: 3000,
        });
    } catch {
        emit("status", "disconnected");
        return null;
    }

    socket.on("connect", () => emit("status", "connected"));
    socket.on("disconnect", () => emit("status", "disconnected"));
    socket.on("connect_error", () => emit("status", "disconnected"));

    // Forward server chat events to subscribers.
    for (const event of [
        "chat:connected",
        "chat:new-message",
        "chat:message-updated",
        "chat:message-deleted",
        "chat:reaction",
        "chat:read",
        "chat:typing",
        "chat:error",
    ]) {
        socket.on(event, (payload) => emit(event, payload));
    }

    return socket;
};

export const disconnectChatSocket = () => {
    socket?.disconnect();
    socket = null;
};

export const joinChat = (chatId) => socket?.emit("chat:join", chatId);
export const leaveChat = (chatId) => socket?.emit("chat:leave", chatId);
export const sendTyping = (chatId) => socket?.emit("chat:typing", chatId);

// Subscribes to a socket event (e.g. "chat:new-message", "chat:typing",
// "status"). Returns an unsubscribe function.
export const onChatEvent = (event, callback) => {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(callback);
    return () => listeners.get(event)?.delete(callback);
};
