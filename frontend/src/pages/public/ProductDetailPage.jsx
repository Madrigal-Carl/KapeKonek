import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { getProduct } from "@/constants/products";
import { useCart } from "@/hooks/useCart";

function NotFound() {
  return (
    <div className="kk-container py-32 text-center">
      <h1 className="text-2xl font-bold">Product not found</h1>
      <Link
        to="/products"
        className="label-mono mt-6 inline-block border border-[var(--color-foreground)] px-5 py-3"
      >
        Back to Products
      </Link>
    </div>
  );
}

export function ProductDetailPage() {
  const { productId } = useParams();
  const product = getProduct(productId);
  const { add, setOpen, formatPrice } = useCart();
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);

  if (!product) return <NotFound />;

  const gallery =
    product.gallery && product.gallery.length
      ? product.gallery
      : [product.image];
  const total = product.price * qty;

  return (
    <div className="bg-[var(--color-background)]">
      <div className="kk-container border-b border-[var(--color-border)] py-4">
        <Link
          to={"/products"}
          className="label-mono inline-flex items-center gap-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
        >
          <ArrowLeft size={14} /> Back
        </Link>
      </div>

      <section className="kk-container grid gap-10 py-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-16">
        {/* Gallery */}
        <div>
          <div className="overflow-hidden border border-[var(--color-border)] bg-[var(--color-neutral-warm)]">
            <img
              src={gallery[active]}
              alt={product.name}
              className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`aspect-square overflow-hidden border ${
                    i === active
                      ? "border-[var(--color-foreground)]"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  <img
                    src={g}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="label-mono text-[var(--color-accent)]">
            {product.category} - {product.variety}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
            {product.name}
          </h1>
          <p className="label-mono mt-3 text-base text-[var(--color-muted-foreground)]">
            By {product.seller}
          </p>

          <div className="mt-6 flex items-end gap-4 border-y border-[var(--color-border)] py-6">
            <span className="text-4xl font-extrabold sm:text-5xl">
              {formatPrice(product.price)}
            </span>
            <span className="label-mono pb-1 text-base text-[var(--color-muted-foreground)]">
              / {product.weightKg}kg
            </span>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-px bg-[var(--color-border)]">
            <Meta k="Available Stock" v={`${product.stock} units`} />
            <Meta k="Weight" v={`${product.weightKg} KG`} />
          </dl>

          <p className="mt-6 text-base leading-relaxed text-[var(--color-muted-foreground)]">
            {product.description}
          </p>

          {/* Quantity */}
          <div className="mt-8 flex flex-wrap items-end gap-6">
            <div>
              <span className="label-mono text-[var(--color-muted-foreground)]">
                Quantity
              </span>
              <div className="mt-2 flex h-12 items-stretch border border-[var(--color-border)]">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="grid w-12 place-items-center hover:bg-[var(--color-neutral-warm)]"
                  aria-label="Decrease"
                >
                  <Minus size={14} />
                </button>
                <input
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.max(1, Number(e.target.value) || 1))
                  }
                  inputMode="numeric"
                  className="w-14 border-x border-[var(--color-border)] bg-[var(--color-background)] text-center text-base outline-none"
                />

                <button
                  onClick={() => setQty(qty + 1)}
                  className="grid w-12 place-items-center hover:bg-[var(--color-neutral-warm)]"
                  aria-label="Increase"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div>
              <span className="label-mono text-[var(--color-muted-foreground)]">
                Total
              </span>
              <p className="mt-2 text-2xl font-bold sm:text-3xl">
                {formatPrice(total)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              onClick={() => add(product, qty)}
              className="label-mono inline-flex w-full items-center justify-center gap-2 bg-[var(--color-accent)] px-6 py-4 text-[var(--color-accent-foreground)] transition-transform active:scale-[0.98] sm:w-auto sm:flex-1"
            >
              <ShoppingBag size={16} /> Add to Cart
            </button>
            <Link
              to="/products"
              onClick={() => setOpen(false)}
              className="label-mono inline-flex w-full items-center justify-center border border-[var(--color-foreground)] px-6 py-4 text-[var(--color-foreground)] hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)] sm:w-auto"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Seller Information */}
          <div className="mt-12 border-t border-[var(--color-border)] pt-8">
            <h2 className="label-mono text-[var(--color-accent)]">
              Seller Information
            </h2>
            <div className="mt-5 flex items-start gap-4">
              <div className="grid h-12 w-12 flex-shrink-0 place-items-center bg-[var(--color-foreground)] text-base text-[var(--color-background)] font-bold">
                {product.seller.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--color-foreground)]">
                  {product.seller}
                </p>
                <p className="label-mono mt-1 text-xs text-[var(--color-muted-foreground)]">
                  {product.sellerLocation}
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                  {product.sellerProductsSold} sold
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Meta({ k, v }) {
  return (
    <div className="bg-[var(--color-background)] p-4">
      <dt className="label-mono text-[var(--color-muted-foreground)]">{k}</dt>
      <dd className="mt-1.5 text-base font-semibold">{v}</dd>
    </div>
  );
}
