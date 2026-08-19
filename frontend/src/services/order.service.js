import api from "@/api/axios";

export async function createOrder(data) {
    const response = await api.post("/orders", data);
    return response.data;
}

export async function getOrders(params = {}) {
    const response = await api.get("/orders", { params });
    return response.data;
}

export async function getMyOrders(params = {}) {
    return getOrders(params);
}

export async function getOrderDetail(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
}

export async function updateOrderStatus(id, data = {}) {
    const response = await api.patch(`/orders/${id}/status`, data);
    return response.data;
}

export async function reserveOrder(id, data = {}) {
    const response = await api.patch(`/orders/${id}/reserve`, data);
    return response.data;
}

export async function completeOrder(id) {
    const response = await api.patch(`/orders/${id}/complete`);
    return response.data;
}

export async function cancelOrder(id, data = {}) {
    const response = await api.patch(`/orders/${id}/cancel`, data);
    return response.data;
}
