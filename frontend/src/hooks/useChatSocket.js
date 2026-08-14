import { useEffect, useState } from "react";
import {
    connectChatSocket,
    disconnectChatSocket,
    joinChat,
    leaveChat,
    onChatEvent,
    sendTyping,
} from "@/services/chatSocket";

// Transport-level hook for the realtime chat socket. When enabled, keeps
// the shared socket connected and joins/leaves the given chat room. The
// socket's connection lifecycle is owned by the app-level watcher, so this
// hook only joins/leaves rooms and subscribes to status.
export function useChatSocket({ chatId, enabled = true } = {}) {
    const [status, setStatus] = useState("disconnected");

    useEffect(() => {
        if (!enabled) return;

        connectChatSocket();
        const offStatus = onChatEvent("status", setStatus);

        return () => {
            offStatus();
        };
    }, [enabled]);

    useEffect(() => {
        if (!enabled || !chatId) return;
        joinChat(chatId);
        return () => leaveChat(chatId);
    }, [chatId, enabled]);

    return {
        status,
        joinChat,
        leaveChat,
        sendTyping,
        onChatEvent,
    };
}
