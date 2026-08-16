import api from "@/api/axios";

export async function getAssociations() {
    const response = await api.get("/associations");

    return response.data;
}

export async function getAssociationFarmers(associationId) {
    const response = await api.get(`/associations/${associationId}/farmers`);

    return response.data;
}
