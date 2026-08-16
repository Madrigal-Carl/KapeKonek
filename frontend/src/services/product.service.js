import api from "@/api/axios";

export async function getProducts(params = {}) {
    const response = await api.get("/products", { params });

    return response.data;
}

export async function createProduct(data) {
    const response = await api.post("/products", data);

    return response.data;
}

export async function updateProduct(id, data) {
    const response = await api.patch(`/products/${id}`, data);

    return response.data;
}

export async function deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);

    return response.data;
}
