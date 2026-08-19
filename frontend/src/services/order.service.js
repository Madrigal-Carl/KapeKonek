import api from "@/api/axios";

export async function createOrder(data) {
    const response = await api.post("/orders", data);

    return response.data;
}

export async function getMyOrders(params = {}) {
    const response = await api.get("/orders", { params });

    return response.data;
}
