import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createCoffeeBean,
    deleteCoffeeBean,
    getCoffeeBeanDetail,
    getCoffeeBeans,
    updateCoffeeBean,
    updateCoffeeBeanPrice,
} from "@/services/coffeeBean.service";
import { notifyError, notifySuccess } from "@/utils/notify";

export const coffeeBeanKeys = {
    all: ["coffeeBeans"],
    list: (filters) => ["coffeeBeans", "list", filters],
    detail: (id) => ["coffeeBeans", "detail", id],
};

export function useCoffeeBeans(filters = {}, options = {}) {
    return useQuery({
        queryKey: coffeeBeanKeys.list(filters),
        queryFn: () =>
            getCoffeeBeans(filters).then((response) => response.coffeeBeans),
        ...options,
    });
}

export function useCoffeeBeanDetail(id, options = {}) {
    return useQuery({
        queryKey: coffeeBeanKeys.detail(id),
        queryFn: () =>
            getCoffeeBeanDetail(id).then((response) => response.coffeeBean),
        enabled: Boolean(id),
        ...options,
    });
}

export function useCreateCoffeeBean() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => createCoffeeBean(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: coffeeBeanKeys.all });
            notifySuccess("Beans added successfully");
        },
        onError: (error) => notifyError(error, "Failed to add beans"),
    });
}

export function useUpdateCoffeeBean() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => updateCoffeeBean(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: coffeeBeanKeys.all });
            notifySuccess("Changes saved successfully");
        },
        onError: (error) => notifyError(error, "Failed to update beans"),
    });
}

export function useUpdateCoffeeBeanPrice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, price }) => updateCoffeeBeanPrice(id, price),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: coffeeBeanKeys.all });
            notifySuccess("Price updated successfully");
        },
        onError: (error) => notifyError(error, "Failed to update price"),
    });
}

export function useDeleteCoffeeBean() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => deleteCoffeeBean(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: coffeeBeanKeys.all });
            notifySuccess("Beans archived successfully");
        },
        onError: (error) => notifyError(error, "Failed to archive beans"),
    });
}
