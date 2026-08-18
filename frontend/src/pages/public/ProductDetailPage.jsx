import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, ArrowLeft, Star } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import useAuth from "@/hooks/useAuth";
import useProtectedAction from "@/hooks/useProtectedAction";
import {
  useCreateProductReview,
  useProductDetail,
  useProductReviews,
} from "@/hooks/useProducts";
import { useToastStore } from "@/stores/toast.store";

const capitalize = (value) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const timeAgo = (value) => {
  if (!value) return "";
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function StarRating({ rating = 0, size = 16 }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
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
      <span className="label-mono ml-0.5 text-[var(--color-muted-foreground)]">
        {rating > 0 ? rating.toFixed(1) : "0"}
      </span>
    </div>
  );
}

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

/** Interactive star picker for the review form */
function StarPicker({ value, onChange, size = 26 }) {
  const [hover, setHover] = useState(0);
  const stars = [1, 2, 3, 4, 5];
  const display = hover || value;

  return (
    <div className="flex items-center gap-1">
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
          className="p-0.5"
        >
          <Star
            size={size}
            className={
              display >= n
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-border)]"
            }
            fill="currentColor"
          />
        </button>
      ))}
    </div>
  );
}

export function ProductDetailPage() {
  const { productId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { add, setOpen, formatPrice } = useCart();
  const showToast = useToastStore((s) => s.show);
  const protectedAction = useProtectedAction();

  const { data: product, isLoading, isError } = useProductDetail(productId);
  const { data: reviews = [] } = useProductReviews(productId);
  const createReview = useCreateProductReview();

  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [formError, setFormError] = useState("");

  if (isLoading) {
    return (
      <div className="kk-container py-32 text-center">
        <p className="text-muted-foreground">Loading product…</p>
      </div>
    );
  }

  if (isError || !product) return <NotFound />;

  const gallery =
    product.imageUrls?.length > 0
      ? product.imageUrls.map((image) => image.url)
      : [];

  // The unit follows the product owner: kaluppa-owned listings are priced and
  // sold by stock; farmer-owned listings are priced and sold by weight (kg).
  const isKaluppaOwned = product.owner?.role === "kaluppa";
  const unitLabel = isKaluppaOwned ? "stock" : "kg";
  const isWeightMode = !isKaluppaOwned; // farmer owner -> enter a weight

  // How much is sellable for this listing.
  const available = isKaluppaOwned ? product.stock : product.weight;
  const availableLabel = isKaluppaOwned ? "Available Stock" : "Available Weight";

  const quantityStep = isWeightMode ? 0.25 : 1;
  const quantityLabel = isWeightMode ? "Weight (kg)" : "Quantity (stock)";
  const overLimit = available != null && qty > available;

  const setQtyValue = (value) => {
    const parsed = Number(value);
    const minimum = isWeightMode ? 0.25 : 1;
    if (Number.isNaN(parsed)) return setQty(minimum);
    setQty(Math.max(minimum, parsed));
  };

  const stepQty = (delta) => {
    const minimum = isWeightMode ? 0.25 : 1;
    const maximum = available ?? Infinity;
    const next = Math.min(maximum, Math.max(minimum, qty + delta));
    setQty(Math.round(next * 100) / 100);
  };

  const total = product.price * qty;

  const handleAddToCart = () => {
    if (overLimit) return;
    const line = {
      ...product,
      id: product._id,
      unit: unitLabel,
    };
    add(line, qty);
    showToast(
      `${capitalize(product.variety)} · ${qty} ${unitLabel} added to cart`,
      {
        actionLabel: "View Cart",
        onAction: () => setOpen(true),
      },
    );
  };

  const submitReview = () => {
    if (newRating === 0) {
      setFormError("Please select a star rating.");
      return;
    }
    if (!newComment.trim()) {
      setFormError("Please write a short comment.");
      return;
    }
    setFormError("");
    createReview.mutate(
      { id: product._id, data: { rating: newRating, message: newComment.trim() } },
      {
        onSuccess: () => {
          setNewRating(0);
          setNewComment("");
        },
      },
    );
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    // Guests are redirected to login, same as adding to cart.
    protectedAction({
      onSuccess: submitReview,
      unauthorizedMessage: "Please log in to review this product.",
    });
  };

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
              alt={capitalize(product.variety)}
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
            {capitalize(product.category)}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
            {capitalize(product.variety)}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StarRating rating={product.rating ?? 0} />
            <span className="label-mono text-[var(--color-muted-foreground)]">
              ({product.ratingCount ?? 0} review
              {(product.ratingCount ?? 0) === 1 ? "" : "s"})
            </span>
          </div>

          <p className="label-mono mt-3 text-base text-[var(--color-muted-foreground)]">
            By {product.owner?.fullName ?? "KapeKonek"}
          </p>

          <div className="mt-6 flex items-end gap-4 border-y border-[var(--color-border)] py-6">
            <span className="text-4xl font-extrabold sm:text-5xl">
              {formatPrice(product.price)}
            </span>
            <span className="label-mono pb-1 text-base text-[var(--color-muted-foreground)]">
              / {unitLabel}
            </span>
          </div>

          {/* Availability — follows the owner: stock for kaluppa, weight for farmers */}
          {available != null && (
            <dl className="mt-6 grid grid-cols-1 gap-px bg-[var(--color-border)]">
              <div className="flex items-center justify-between bg-[var(--color-background)] p-4">
                <dt className="label-mono text-[var(--color-muted-foreground)]">
                  {availableLabel}
                </dt>
                <dd className="mt-0 text-base font-semibold">
                  {available.toLocaleString()}
                  {isWeightMode ? " kg" : ""}
                </dd>
              </div>
            </dl>
          )}

          <p className="mt-6 text-base leading-relaxed text-[var(--color-muted-foreground)]">
            {product.description}
          </p>

          {/* Quantity / weight */}
          <div className="mt-8 flex flex-wrap items-end gap-6">
            <div>
              <span className="label-mono text-[var(--color-muted-foreground)]">
                {quantityLabel}
              </span>
              <div className="mt-2 flex h-12 items-stretch border border-[var(--color-border)]">
                <button
                  onClick={() => stepQty(-quantityStep)}
                  className="grid w-12 place-items-center hover:bg-[var(--color-neutral-warm)]"
                  aria-label="Decrease"
                >
                  <Minus size={14} />
                </button>
                <input
                  value={qty}
                  onChange={(e) => setQtyValue(e.target.value)}
                  inputMode="decimal"
                  step={quantityStep}
                  className="w-16 border-x border-[var(--color-border)] bg-[var(--color-background)] text-center text-base outline-none"
                />
                <button
                  onClick={() => stepQty(quantityStep)}
                  className="grid w-12 place-items-center hover:bg-[var(--color-neutral-warm)]"
                  aria-label="Increase"
                >
                  <Plus size={14} />
                </button>
              </div>
              {overLimit && (
                <p className="mt-1.5 text-sm text-[var(--color-destructive)]">
                  Only {available} {unitLabel}
                  {available === 1 ? "" : "s"} available.
                </p>
              )}
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
              onClick={handleAddToCart}
              disabled={overLimit}
              className="label-mono inline-flex w-full items-center justify-center gap-2 bg-[var(--color-accent)] px-6 py-4 text-[var(--color-accent-foreground)] transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:flex-1"
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
                {(product.owner?.fullName ?? "K").charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--color-foreground)]">
                  {product.owner?.fullName ?? "KapeKonek"}
                </p>
                <p className="label-mono mt-1 text-xs text-[var(--color-muted-foreground)]">
                  {product.farm?.propertyNumber}
                  {product.farm?.address ? ` · ${product.farm.address}` : ""}
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                  {product.soldCount ?? 0} sold
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="kk-container max-w-3xl py-14">
          <h2 className="label-mono text-[var(--color-accent)]">
            Ratings &amp; Reviews
          </h2>

          {/* Review form — logged-in users can submit; guests are sent to
              login when they try */}
          <form
            onSubmit={handleSubmitReview}
            className="mt-8 border border-[var(--color-border)] bg-[var(--color-background)] p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="label-mono text-[var(--color-muted-foreground)]">
                Write a review
              </span>
              {isAuthenticated ? (
                <span className="label-mono text-xs text-[var(--color-muted-foreground)]">
                  {user?.firstName} {user?.lastName}
                </span>
              ) : (
                <span className="label-mono text-xs text-[var(--color-muted-foreground)]">
                  Log in to review — you&apos;ll be redirected.
                </span>
              )}
            </div>
            <div className="mt-3">
              <StarPicker value={newRating} onChange={setNewRating} />
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={3}
              className="mt-4 w-full resize-none border border-[var(--color-border)] bg-[var(--color-background)] p-3 text-sm outline-none focus:border-[var(--color-foreground)]"
            />
            {formError && (
              <p className="mt-2 text-sm text-[var(--color-destructive)]">
                {formError}
              </p>
            )}
            <button
              type="submit"
              disabled={createReview.isPending}
              className="label-mono mt-4 inline-flex items-center gap-2 bg-[var(--color-accent)] px-6 py-3 text-[var(--color-accent-foreground)] transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createReview.isPending ? "Submitting…" : "Submit Review"}
            </button>
          </form>

          {/* Review list */}
          <div className="mt-10 divide-y divide-[var(--color-border)]">
            {reviews.length === 0 && (
              <p className="py-6 text-sm text-[var(--color-muted-foreground)]">
                No reviews yet. Be the first to leave one.
              </p>
            )}
            {reviews.map((r) => (
              <div key={r._id} className="py-5 first:pt-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 flex-shrink-0 place-items-center bg-[var(--color-foreground)] text-sm font-bold text-[var(--color-background)]">
                      {(r.author?.fullName ?? "?").charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {r.author?.fullName ?? "Anonymous"}
                      </p>
                      <StarRating rating={r.rating} size={13} />
                    </div>
                  </div>
                  <span className="label-mono flex-shrink-0 text-[var(--color-muted-foreground)]">
                    {timeAgo(r.createdAt)}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
                  {r.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
