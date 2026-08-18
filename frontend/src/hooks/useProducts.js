import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createProduct,
    createProductReview,
    deleteProduct,
    getCatalogProducts,
    getProductDetail,
    getProductReviews,
    getProducts,
    updateProduct,
    updateProductPrice,
} from "@/services/product.service";
import { notifyError, notifySuccess } from "@/utils/notify";

export const productKeys = {
    all: ["products"],
    list: (filters) => ["products", "list", filters],
    catalog: ["products", "catalog"],
    detail: (id) => ["products", "detail", id],
    reviews: (id) => ["products", "reviews", id],
};

export function useProducts(filters = {}, options = {}) {
    return useQuery({
        queryKey: productKeys.list(filters),
        queryFn: () =>
            getProducts(filters).then((response) => response.products),
        ...options,
    });
}

export function useCatalogProducts(options = {}) {
    return useQuery({
        queryKey: productKeys.catalog,
        queryFn: () =>
            getCatalogProducts({ all: true }).then(
                (response) => response.products,
            ),
        ...options,
    });
}

export function useProductDetail(id, options = {}) {
    return useQuery({
        queryKey: productKeys.detail(id),
        queryFn: () => getProductDetail(id).then((response) => response.product),
        enabled: Boolean(id),
        ...options,
    });
}

export function useProductReviews(id, options = {}) {
    return useQuery({
        queryKey: productKeys.reviews(id),
        queryFn: () =>
            getProductReviews(id).then((response) => response.reviews),
        enabled: Boolean(id),
        ...options,
    });
}

export function useCreateProductReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => createProductReview(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.all });
            notifySuccess("Review submitted");
        },
        onError: (error) => notifyError(error, "Failed to submit review"),
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

export function useUpdateProductPrice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, price }) => updateProductPrice(id, price),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.all });
            notifySuccess("Price updated successfully");
        },
        onError: (error) => notifyError(error, "Failed to update price"),
    });
}
