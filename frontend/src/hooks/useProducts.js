import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createProduct,
    deleteProduct,
    getProducts,
    updateProduct,
} from "@/services/product.service";
import { notifyError, notifySuccess } from "@/utils/notify";

export const productKeys = {
    all: ["products"],
    list: (filters) => ["products", "list", filters],
};

export function useProducts(filters = {}, options = {}) {
    return useQuery({
        queryKey: productKeys.list(filters),
        queryFn: () =>
            getProducts(filters).then((response) => response.products),
        ...options,
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.all });
            notifySuccess("Product created successfully");
        },
        onError: (error) => notifyError(error, "Failed to create product"),
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => updateProduct(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.all });
            notifySuccess("Changes saved successfully");
        },
        onError: (error) => notifyError(error, "Failed to update product"),
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.all });
            notifySuccess("Product archived successfully");
        },
        onError: (error) => notifyError(error, "Failed to archive product"),
    });
}
