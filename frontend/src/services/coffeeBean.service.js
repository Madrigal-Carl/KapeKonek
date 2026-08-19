import api from "@/api/axios";

export async function getCoffeeBeans(params = {}) {
    const response = await api.get("/coffee-beans", { params });

    return response.data;
}

export async function getCoffeeBeanDetail(id) {
    const response = await api.get(`/coffee-beans/${id}`);

    return response.data;
}

export async function createCoffeeBean(data) {
    const response = await api.post("/coffee-beans", data);

    return response.data;
}

export async function updateCoffeeBean(id, data) {
    const response = await api.patch(`/coffee-beans/${id}`, data);

    return response.data;
}

export async function updateCoffeeBeanPrice(id, price) {
    const response = await api.patch(`/coffee-beans/${id}/price`, { price });

    return response.data;
}

export async function deleteCoffeeBean(id) {
    const response = await api.delete(`/coffee-beans/${id}`);

    return response.data;
}
