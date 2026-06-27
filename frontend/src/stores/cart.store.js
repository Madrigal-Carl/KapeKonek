import { create } from "zustand";
import { persist } from "zustand/middleware";

export function formatPrice(n) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
    }).format(n);
}

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            open: false,

            // ── Actions ───────────────────────────────────────────────────────
            setOpen: (open) => set({ open }),

            add: (product, qty = 1) =>
                set((state) => {
                    const idx = state.items.findIndex((i) => i.product.id === product.id);
                    const items =
                        idx === -1
                            ? [...state.items, { product, qty }]
                            : state.items.map((i, index) =>
                                index === idx ? { ...i, qty: i.qty + qty } : i
                            );
                    return { items, open: true };
                }),

            remove: (id) =>
                set((state) => ({
                    items: state.items.filter((i) => i.product.id !== id),
                })),

            setQty: (id, qty) =>
                set((state) => ({
                    items:
                        qty <= 0
                            ? state.items.filter((i) => i.product.id !== id)
                            : state.items.map((i) => (i.product.id === id ? { ...i, qty } : i)),
                })),

            clear: () => set({ items: [] }),
        }),
        {
            name: "kapekonek-cart",
            partialize: (state) => ({ items: state.items }),
        }
    )
);