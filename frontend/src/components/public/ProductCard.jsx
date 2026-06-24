import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export function ProductCard({ product, variant = "grid" }) {
  const { add, formatPrice } = useCart();

  if (variant === "list") {
    return (
      <article className="group grid grid-cols-[140px_1fr_auto] gap-6 border border-[var(--color-border)] bg-[var(--color-background)] p-4 transition-colors hover:bg-[var(--color-surface)] sm:grid-cols-[180px_1fr_auto]">
        <Link to={`/products/${product.id}`} className="block overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="flex min-w-0 flex-col">
          <span className="label-mono text-[var(--color-muted-foreground)]">
            {product.category}
          </span>
          <Link to={`/products/${product.id}`} className="mt-1">
            <h3 className="truncate text-lg font-bold hover:text-[var(--color-accent)]">
              {product.name}
            </h3>
          </Link>
          <p className="mt-2 line-clamp-2 text-sm text-[var(--color-muted-foreground)]">
            {product.description}
          </p>
          <p className="label-mono mt-auto pt-3 text-[var(--color-muted-foreground)]">
            By {product.seller}
          </p>
        </div>
        <div className="flex flex-col items-end justify-between">
          <span className="text-lg font-bold">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={() => add(product)}
            className="label-mono mt-3 inline-flex items-center gap-2 bg-[var(--color-accent)] px-4 py-2.5 text-[var(--color-accent-foreground)] transition-colors hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)]"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col border border-[var(--color-border)] bg-[var(--color-background)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_0_-8px_var(--color-foreground)]">
      <Link
        to={`/products/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-[var(--color-neutral-warm)]"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <span className="label-mono absolute left-3 top-3 bg-[var(--color-background)] px-2 py-1 text-[var(--color-foreground)]">
          {product.category}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-base font-bold leading-snug hover:text-[var(--color-accent)]">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm text-[var(--color-muted-foreground)]">
          {product.description}
        </p>
        <p className="label-mono mt-3 text-[var(--color-muted-foreground)]">
          {product.seller}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
          <span className="text-lg font-bold">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={() => add(product)}
            className="label-mono inline-flex items-center gap-2 bg-[var(--color-accent)] px-6 py-2.5 text-sm text-[var(--color-accent-foreground)] transition-colors hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)]"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
    </article>
  );
}
