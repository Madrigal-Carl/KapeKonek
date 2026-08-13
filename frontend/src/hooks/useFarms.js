import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createFarm,
    deleteFarm,
    getFarms,
    getJoinableFarms,
    joinFarm,
    leaveFarm,
    updateFarm,
} from "@/services/farm.service";
import { notifyError, notifySuccess } from "@/utils/notify";

export const farmKeys = {
    all: ["farms"],
    list: (filters) => ["farms", "list", filters],
    joinable: ["farms", "joinable"],
};

export function useFarms(filters = {}, options = {}) {
    return useQuery({
        queryKey: farmKeys.list(filters),
        queryFn: () => getFarms(filters).then((response) => response.farms),
        ...options,
    });
}

export function useJoinableFarms(options = {}) {
    return useQuery({
        queryKey: farmKeys.joinable,
        queryFn: () => getJoinableFarms().then((response) => response.farms),
        ...options,
    });
}

export function useCreateFarm() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => createFarm(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: farmKeys.all });
            notifySuccess("Farm created successfully");
        },
        onError: (error) => notifyError(error, "Failed to create farm"),
    });
}

export function useUpdateFarm() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => updateFarm(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: farmKeys.all });
            notifySuccess("Changes saved successfully");
        },
        onError: (error) => notifyError(error, "Failed to update farm"),
    });
}

export function useDeleteFarm() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => deleteFarm(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: farmKeys.all });
            notifySuccess("Farm archived successfully");
        },
        onError: (error) => notifyError(error, "Failed to archive farm"),
    });
}

export function useJoinFarm() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => joinFarm(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: farmKeys.all });
            queryClient.invalidateQueries({ queryKey: farmKeys.joinable });
            notifySuccess("Farm added successfully");
        },
        onError: (error) => notifyError(error, "Failed to add farm"),
    });
}

export function useLeaveFarm() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => leaveFarm(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: farmKeys.all });
            queryClient.invalidateQueries({ queryKey: farmKeys.joinable });
            notifySuccess("Left farm successfully");
        },
        onError: (error) => notifyError(error, "Failed to leave farm"),
    });
}
