import api from "@/api/axios";

export async function getUsers(params = {}) {
    const response = await api.get("/users", { params });

    return response.data;
}

export async function getAvailableFarmers() {
    const response = await api.get("/users/available-farmers");

    return response.data;
}

export async function createUser(data) {
    const response = await api.post("/users", data);

    return response.data;
}

export async function updateUser(id, data) {
    const response = await api.patch(`/users/${id}`, data);

    return response.data;
}

// Updates the authenticated user's own profile (address, name, contact).
export async function updateMyProfile(data) {
    const response = await api.patch("/users/me", data);

    return response.data;
}

export async function deleteUser(id) {
    const response = await api.delete(`/users/${id}`);

    return response.data;
}

export async function reviewAccount(id, data) {
    const response = await api.patch(`/users/${id}/review-account`, data);

    return response.data;
}

export async function reviewAssociation(id, data) {
    const response = await api.patch(`/users/${id}/review-association`, data);

    return response.data;
}
