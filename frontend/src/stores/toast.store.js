import { create } from "zustand";
import { getErrorMessage } from "@/utils/getErrorMessage";

let counter = 0;
const TOAST_DURATION = 2800;
const LEAVE_DURATION = 250;

export const useToastStore = create((set, get) => ({
    toasts: [],

    show: (message, opts = {}) => {
        const id = `toast-${Date.now()}-${counter++}`;
        const toast = {
            id,
            message,
            type: opts.type ?? "success",
            actionLabel: opts.actionLabel,
            onAction: opts.onAction,
            leaving: false,
        };

        set((state) => ({ toasts: [...state.toasts, toast] }));

        setTimeout(() => get().dismiss(id), TOAST_DURATION);

        return id;
    },

    // Shows the backend-provided error message (response body), falling back
    // to a generic message when the server doesn't return one.
    showError: (error, fallback = "Something went wrong") =>
        get().show(getErrorMessage(error, fallback), { type: "error" }),

    dismiss: (id) => {
        set((state) => ({
            toasts: state.toasts.map((t) =>
                t.id === id ? { ...t, leaving: true } : t
            ),
        }));

        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id),
            }));
        }, LEAVE_DURATION);
    },
}));
