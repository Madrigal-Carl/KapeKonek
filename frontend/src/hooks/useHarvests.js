import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createHarvest,
    deleteHarvest,
    getHarvests,
    updateHarvest,
} from "@/services/harvest.service";
import { notifyError, notifySuccess } from "@/utils/notify";

export const harvestKeys = {
    all: ["harvests"],
    list: (filters) => ["harvests", "list", filters],
};

export function useHarvests(filters = {}, options = {}) {
    return useQuery({
        queryKey: harvestKeys.list(filters),
        queryFn: () =>
            getHarvests(filters).then((response) => response.harvests),
        ...options,
    });
}

export function useCreateHarvest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => createHarvest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: harvestKeys.all });
            notifySuccess("Harvest created successfully");
        },
        onError: (error) => notifyError(error, "Failed to create harvest"),
    });
}

export function useUpdateHarvest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => updateHarvest(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: harvestKeys.all });
            notifySuccess("Changes saved successfully");
        },
        onError: (error) => notifyError(error, "Failed to update harvest"),
    });
}

export function useDeleteHarvest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => deleteHarvest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: harvestKeys.all });
            notifySuccess("Harvest archived successfully");
        },
        onError: (error) => notifyError(error, "Failed to archive harvest"),
    });
}
