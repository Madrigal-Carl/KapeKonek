import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    cancelOrder,
    completeOrder,
    getOrderDetail,
    getOrders,
    reserveOrder,
    updateOrderStatus,
} from "@/services/order.service";
import { notifyError, notifySuccess } from "@/utils/notify";

export const orderKeys = {
    all: ["orders"],
    list: (filters) => ["orders", "list", filters],
    detail: (id) => ["orders", "detail", id],
};

export function useOrders(filters = {}, options = {}) {
    return useQuery({
        queryKey: orderKeys.list(filters),
        queryFn: () => getOrders(filters).then((response) => response.orders),
        ...options,
    });
}

export function useOrderDetail(id, options = {}) {
    return useQuery({
        queryKey: orderKeys.detail(id),
        queryFn: () => getOrderDetail(id).then((response) => response.order),
        enabled: Boolean(id),
        ...options,
    });
}

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => updateOrderStatus(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            notifySuccess("Order status updated successfully");
        },
        onError: (error) => notifyError(error, "Failed to update order status"),
    });
}

export function useReserveOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => reserveOrder(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            notifySuccess("Order marked as reserved. Stock updated and customer notified.");
        },
        onError: (error) => notifyError(error, "Failed to reserve order"),
    });
}

export function useCompleteOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => completeOrder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
            notifySuccess("Order marked as completed. Customer notified.");
        },
        onError: (error) => notifyError(error, "Failed to complete order"),
    });
}

export function useCancelOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => cancelOrder(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            notifySuccess("Order cancelled successfully");
        },
        onError: (error) => notifyError(error, "Failed to cancel order"),
    });
}
