import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui";

export function CartDrawer() {
  const { items, open, setOpen, setQty, remove, count, subtotal, formatPrice } =
    useCart();
  const navigate = useNavigate();
  const [removeTarget, setRemoveTarget] = useState(null); // { id, name } | null

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleCheckout = () => {
    setOpen(false);
    navigate("/checkout");
  };

  const handleRemoveClick = (item) => {
    setRemoveTarget({ id: item.product.id, name: item.product.name });
  };

  const handleRemoveConfirm = () => {
    if (removeTarget) remove(removeTarget.id);
    setRemoveTarget(null);
  };

  return (
    <>
      {/* overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 bg-foreground-40 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <p className="label-mono text-muted-foreground">Your Cart</p>
            <h3 className="mt-1 text-lg font-bold">
              {count} {count === 1 ? "item" : "items"}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-10 w-10 place-items-center border border-border hover:bg-[var(--color-neutral-warm)]"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <ShoppingBag size={32} className="text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                Your cart is empty.
              </p>
              <Link
                to="/products"
                onClick={() => setOpen(false)}
                className="label-mono mt-6 border border-foreground bg-foreground px-5 py-3 text-background"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <ul>
              {items.map((it) => (
                <li
                  key={it.product.id}
                  className="flex gap-4 border-b border-border px-6 py-5"
                >
                  <img
                    src={it.product.image}
                    alt={it.product.name}
                    className="h-20 w-20 flex-shrink-0 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="truncate text-sm font-semibold">
                        {it.product.name}
                      </h4>
                      <button
                        onClick={() => handleRemoveClick(it)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Remove"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p className="label-mono mt-1 text-muted-foreground">
                      {formatPrice(it.product.price)}
                      <span aria-hidden="true">·</span> {it.product.stock} stock
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-border">
                        <button
                          className="grid h-8 w-8 place-items-center hover:bg-[var(--color-neutral-warm)]"
                          onClick={() => setQty(it.product.id, it.qty - 1)}
                          aria-label="Decrease"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="label-mono w-8 text-center">
                          {it.qty}
                        </span>
                        <button
                          className="grid h-8 w-8 place-items-center hover:bg-[var(--color-neutral-warm)]"
                          onClick={() => setQty(it.product.id, it.qty + 1)}
                          aria-label="Increase"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatPrice(it.qty * it.product.price)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-border bg-[var(--color-surface)] px-6 py-5">
            <dl className="space-y-2 text-sm">
              <Row label="Total Items" value={String(count)} />
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              <Row
                label="Estimated Fees"
                value={formatPrice(Math.round(subtotal * 0.05))}
                muted
              />
              <div className="kk-rule pt-3">
                <Row
                  label="Estimated Total"
                  value={formatPrice(subtotal + Math.round(subtotal * 0.05))}
                  bold
                />
              </div>
            </dl>
            <button
              type="button"
              onClick={handleCheckout}
              className="label-mono mt-5 block w-full bg-[var(--color-accent)] px-5 py-4 text-center text-[var(--color-accent-foreground)] transition-transform active:scale-[0.98]"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={() => setOpen(false)}
              className="label-mono mt-2 w-full border border-border px-5 py-4 text-foreground hover:bg-[var(--color-neutral-warm)]"
            >
              Continue Shopping
            </button>
          </footer>
        )}
      </aside>

      {/* Remove confirmation modal — rendered as a sibling of <aside>, not
          inside it, so it isn't clipped/transformed by the drawer's own
          translate-x transition and instead centers in the viewport. */}
      {removeTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground-40 p-4"
          onClick={() => setRemoveTarget(null)}
        >
          <div
            className="w-full max-w-md border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Trash2 className="h-5 w-5 text-muted-foreground" />
              Remove item?
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-foreground">
                {removeTarget.name}
              </span>{" "}
              from your cart?
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setRemoveTarget(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRemoveConfirm}>
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, value, muted, bold }) {
  return (
    <div className="flex items-center justify-between">
      <dt
        className={`label-mono ${muted ? "text-muted-foreground" : "text-foreground"}`}
      >
        {label}
      </dt>
      <dd className={bold ? "text-base font-bold" : "text-sm"}>{value}</dd>
    </div>
  );
}
