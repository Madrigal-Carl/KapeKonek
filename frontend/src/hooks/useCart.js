import { useCartStore, formatPrice } from "@/stores/cart.store";

export function useCart() {
    const items = useCartStore((s) => s.items);
    const open = useCartStore((s) => s.open);
    const setOpen = useCartStore((s) => s.setOpen);
    const add = useCartStore((s) => s.add);
    const remove = useCartStore((s) => s.remove);
    const setQty = useCartStore((s) => s.setQty);
    const clear = useCartStore((s) => s.clear);

    const count = items.reduce((acc, i) => acc + i.qty, 0);
    const subtotal = items.reduce((acc, i) => acc + i.qty * i.product.price, 0);

    return { items, open, setOpen, add, remove, setQty, clear, count, subtotal, formatPrice };
}