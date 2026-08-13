import api from "@/api/axios";

export async function getHarvests(params = {}) {
    const response = await api.get("/harvests", { params });

    return response.data;
}

export async function createHarvest(data) {
    const response = await api.post("/harvests", data);

    return response.data;
}

export async function updateHarvest(id, data) {
    const response = await api.patch(`/harvests/${id}`, data);

    return response.data;
}

export async function deleteHarvest(id) {
    const response = await api.delete(`/harvests/${id}`);

    return response.data;
}
