import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    deleteMessage,
    getChatMessages,
    getChats,
    sendMessage,
    updateMessage,
} from "@/services/chat.service";
import { notifyError, notifySuccess } from "@/utils/notify";

export const chatKeys = {
    all: ["chats"],
    list: ["chats", "list"],
    messages: (chatId) => ["chats", "messages", chatId],
};

export function useChats(options = {}) {
    return useQuery({
        queryKey: chatKeys.list,
        queryFn: () => getChats().then((response) => response.chats),
        ...options,
    });
}

export function useChatMessages(chatId, options = {}) {
    return useQuery({
        queryKey: chatKeys.messages(chatId),
        queryFn: () =>
            getChatMessages(chatId, { all: true }).then(
                (response) => response.messages,
            ),
        enabled: Boolean(chatId),
        ...options,
    });
}

export function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ chatId, data }) => sendMessage(chatId, data),
        onSuccess: () => {
            // Only the chat list needs a refetch (last-message preview);
            // new messages arrive over the socket and are merged locally.
            queryClient.invalidateQueries({ queryKey: chatKeys.list });
        },
        onError: (error) => notifyError(error, "Failed to send message"),
    });
}

export function useUpdateMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ chatId, messageId, data }) =>
            updateMessage(chatId, messageId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: chatKeys.list });
            notifySuccess("Message updated");
        },
        onError: (error) => notifyError(error, "Failed to update message"),
    });
}

export function useDeleteMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ chatId, messageId }) => deleteMessage(chatId, messageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: chatKeys.list });
            notifySuccess("Message deleted");
        },
        onError: (error) => notifyError(error, "Failed to delete message"),
    });
}
