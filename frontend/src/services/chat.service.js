import api from "@/api/axios";

export async function getChats() {
    const response = await api.get("/chats");

    return response.data;
}

export async function markChatRead(chatId) {
    const response = await api.post(`/chats/${chatId}/read`);

    return response.data;
}

export async function getChatMessages(chatId, params = {}) {
    const response = await api.get(`/chats/${chatId}/messages`, { params });

    return response.data;
}

export async function sendMessage(chatId, data) {
    const response = await api.post(`/chats/${chatId}/messages`, data);

    return response.data;
}

export async function updateMessage(chatId, messageId, data) {
    const response = await api.patch(
        `/chats/${chatId}/messages/${messageId}`,
        data,
    );

    return response.data;
}

export async function deleteMessage(chatId, messageId) {
    const response = await api.delete(`/chats/${chatId}/messages/${messageId}`);

    return response.data;
}
