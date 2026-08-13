import { useToastStore } from "@/stores/toast.store";

export const notify = (message, opts = {}) =>
    useToastStore.getState().show(message, opts);

export const notifySuccess = (message, opts = {}) =>
    useToastStore.getState().show(message, { type: "success", ...opts });

export const notifyError = (error, fallback = "Something went wrong") =>
    useToastStore.getState().showError(error, fallback);

export const notifyInfo = (message, opts = {}) =>
    useToastStore.getState().show(message, { type: "info", ...opts });
