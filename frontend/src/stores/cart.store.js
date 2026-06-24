import { create } from "zustand";

export function formatPrice(n) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
    }).format(n);
}

export const useCartStore = create((set, get) => ({
    items: [],
    open: false,

    // ── Derived values (computed on access) ──────────────────────────────────
    get count() {
        return get().items.reduce((acc, i) => acc + i.qty, 0);
    },
    get subtotal() {
        return get().items.reduce((acc, i) => acc + i.qty * i.product.price, 0);
    },

    // ── Actions ───────────────────────────────────────────────────────────────
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
}));