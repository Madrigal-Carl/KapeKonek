import api from "@/api/axios";

export async function getAssociations() {
    const response = await api.get("/associations");

    return response.data;
}
