import { Link } from "react-router-dom";
import { Plus, Star } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import useProtectedAction from "@/hooks/useProtectedAction";
import { useToastStore } from "@/stores/toast.store";

function StarRating({ rating = 0, size = 14 }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {stars.map((n) => {
          const filled = rating >= n;
          const half = !filled && rating >= n - 0.5;
          return (
            <span key={n} className="relative inline-flex">
              <Star
                size={size}
                className="text-[var(--color-border)]"
                fill="currentColor"
              />
              {(filled || half) && (
                <Star
                  size={size}
                  className="absolute inset-0 text-[var(--color-accent)]"
                  fill="currentColor"
                  style={half ? { clipPath: "inset(0 50% 0 0)" } : undefined}
                />
              )}
            </span>
          );
        })}
      </div>
      <span className="label-mono text-[var(--color-muted-foreground)]">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export function ProductCard({ product, variant = "grid" }) {
  const { add, setOpen, formatPrice } = useCart();
  const protectedAction = useProtectedAction();
  const showToast = useToastStore((s) => s.show);

  const handleAdd = () => {
    protectedAction({
      role: ["buyer", "farmer", "kaluppa"],
      onSuccess: () => {
        add(product);
        showToast(`${product.name} added to cart`, {
          actionLabel: "View Cart",
          onAction: () => setOpen(true),
        });
      },
    });
  };

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
          {typeof product.sellerRating === "number" && (
            <div className="mt-2">
              <StarRating rating={product.sellerRating} />
            </div>
          )}
          <p className="label-mono mt-auto pt-3 text-[var(--color-muted-foreground)]">
            By {product.seller}
          </p>
        </div>
        <div className="flex flex-col items-end justify-between">
          <span className="text-lg font-bold">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAdd}
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
        {typeof product.sellerRating === "number" && (
          <div className="mt-2">
            <StarRating rating={product.sellerRating} />
          </div>
        )}
        <p className="label-mono mt-3 text-[var(--color-muted-foreground)]">
          {product.seller}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
          <span className="text-lg font-bold">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAdd}
            className="label-mono inline-flex items-center gap-2 bg-[var(--color-accent)] px-6 py-2.5 text-sm text-[var(--color-accent-foreground)] transition-colors hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)]"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
    </article>
  );
}
