import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { chatKeys } from "@/hooks/useChats";
import {
    connectChatSocket,
    disconnectChatSocket,
    getActiveChatId,
    onChatEvent,
} from "@/services/chatSocket";

const toLastMessage = (m) => ({
    _id: m._id,
    text: m.text,
    hasAttachments: (m.attachments ?? []).length > 0,
    sender: m.sender,
    createdAt: m.createdAt,
});

// App-level watcher: keeps the socket alive for chat users and maintains
// unread counts on the shared chat list cache, so the sidebar badge updates
// in realtime even while the user is on another page.
export function useChatUnreadWatcher() {
    const queryClient = useQueryClient();
    const { role, user } = useAuth();
    const isChatRole = role === ROLES.MANAGER || role === ROLES.FARMER;
    const userId = user?._id;

    useEffect(() => {
        if (!isChatRole) return;

        connectChatSocket();

        const patchChat = (chatId, updater) =>
            queryClient.setQueryData(chatKeys.list, (old = []) =>
                old.map((chat) => (chat._id === chatId ? updater(chat) : chat)),
            );

        const unsubscribes = [
            onChatEvent("chat:new-message", (d) => {
                // Ignore your own messages and the chat being viewed.
                if (d.sender?._id === userId) return;
                if (d.chatId === getActiveChatId()) return;

                patchChat(d.chatId, (chat) => ({
                    ...chat,
                    unreadCount: (chat.unreadCount ?? 0) + 1,
                    lastMessage: toLastMessage(d.message),
                }));
            }),
            onChatEvent("chat:message-deleted", (d) => {
                patchChat(d.chatId, (chat) => ({
                    ...chat,
                    unreadCount: Math.max((chat.unreadCount ?? 0) - 1, 0),
                }));
            }),
        ];

        return () => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
            disconnectChatSocket();
        };
    }, [isChatRole, queryClient, userId]);
}
