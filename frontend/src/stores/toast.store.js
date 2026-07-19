import { create } from "zustand";

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
            actionLabel: opts.actionLabel,
            onAction: opts.onAction,
            leaving: false,
        };

        set((state) => ({ toasts: [...state.toasts, toast] }));

        setTimeout(() => get().dismiss(id), TOAST_DURATION);

        return id;
    },

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