import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import {
  Minus,
  Plus,
  ShoppingBag,
  ArrowLeft,
  Star,
  Loader2,
} from "lucide-react";
import { getProduct } from "@/constants/products";
import { useCart } from "@/hooks/useCart";
import { useToastStore } from "@/stores/toast.store";

const REVIEWS_PER_PAGE = 3;

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

/** Read-only star display, supports halves (e.g. 4.5) */
function StarRating({ rating = 0, size = 16, showValue = true }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1.5">
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
      {showValue && (
        <span className="label-mono text-[var(--color-muted-foreground)]">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

/** Interactive star picker for the review form */
function StarPicker({ value, onChange, size = 24 }) {
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

/** Seed reviews so the section has content to paginate through */
function seedReviews(product) {
  const base = [
    {
      name: "Marites D.",
      rating: 5,
      comment:
        "Beans arrived fresh and well-packed. Aroma is amazing straight out of the bag — will reorder.",
      daysAgo: 4,
    },
    {
      name: "Jun Bautista",
      rating: 4,
      comment:
        "Good quality overall, though my batch was slightly more acidic than expected. Still solid value.",
      daysAgo: 11,
    },
    {
      name: "Cristy Aquino",
      rating: 5,
      comment:
        "Love supporting the coop directly. You can really taste the difference versus supermarket coffee.",
      daysAgo: 19,
    },
    {
      name: "Paolo Reyes",
      rating: 4,
      comment:
        "Packaging kept everything fresh during shipping. Would like a slightly darker roast option next time.",
      daysAgo: 25,
    },
    {
      name: "Liza Fernandez",
      rating: 5,
      comment:
        "This is now my go-to. Consistent flavor every batch and the seller communicates well about harvest timing.",
      daysAgo: 33,
    },
    {
      name: "Ronnie Castillo",
      rating: 3,
      comment:
        "Decent coffee but delivery took longer than expected. Taste-wise it's fine, nothing extraordinary.",
      daysAgo: 40,
    },
    {
      name: "Angela Mercado",
      rating: 5,
      comment:
        "Bought this as a gift for my dad who's picky about coffee — he loved it and asked me to order more.",
      daysAgo: 48,
    },
    {
      name: "Ferdie Santos",
      rating: 4,
      comment:
        "Great balance of acidity and body. Grind was a bit inconsistent in one bag but overall satisfied.",
      daysAgo: 55,
    },
    {
      name: "Teresa Lim",
      rating: 5,
      comment:
        "Traceability info included with the order was a nice touch. Knowing the farm of origin makes it feel more special.",
      daysAgo: 62,
    },
  ];
  return base.map((r, i) => ({
    id: `${product.id}-seed-${i}`,
    ...r,
  }));
}

export function ProductDetailPage() {
  const { productId } = useParams();
  const product = getProduct(productId);
  const { add, setOpen, formatPrice } = useCart();
  const showToast = useToastStore((s) => s.show);
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);

  const [reviews, setReviews] = useState(() =>
    product ? seedReviews(product) : [],
  );
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [formError, setFormError] = useState("");

  if (!product) return <NotFound />;

  const gallery =
    product.gallery && product.gallery.length
      ? product.gallery
      : [product.image];
  const total = product.price * qty;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : product.sellerRating || 0;

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  const handleLoadMore = () => {
    setLoadingMore(true);
    // Simulated fetch delay — swap for a real paginated API call
    setTimeout(() => {
      setVisibleCount((c) => Math.min(c + REVIEWS_PER_PAGE, reviews.length));
      setLoadingMore(false);
    }, 500);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (newRating === 0) {
      setFormError("Please select a star rating.");
      return;
    }
    if (!newComment.trim()) {
      setFormError("Please write a short comment.");
      return;
    }
    setFormError("");
    setReviews((prev) => [
      {
        id: `local-${Date.now()}`,
        name: "You",
        rating: newRating,
        comment: newComment.trim(),
        daysAgo: 0,
      },
      ...prev,
    ]);
    setVisibleCount((c) => c + 1);
    setNewRating(0);
    setNewComment("");
  };

  const handleAddToCart = () => {
    add(product, qty);
    showToast(`${product.name} added to cart`, {
      actionLabel: "View Cart",
      onAction: () => setOpen(true),
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

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StarRating rating={avgRating} />
            <span className="label-mono text-[var(--color-muted-foreground)]">
              ({reviews.length} review{reviews.length === 1 ? "" : "s"})
            </span>
          </div>

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
              onClick={handleAddToCart}
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

      {/* Reviews */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="kk-container max-w-3xl py-14">
          <h2 className="label-mono text-[var(--color-accent)]">
            Ratings &amp; Reviews
          </h2>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <span className="text-3xl font-extrabold">
              {avgRating.toFixed(1)}
            </span>
            <StarRating rating={avgRating} size={18} showValue={false} />
            <span className="label-mono text-[var(--color-muted-foreground)]">
              Based on {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Review form */}
          <form
            onSubmit={handleSubmitReview}
            className="mt-8 border border-[var(--color-border)] bg-[var(--color-background)] p-5"
          >
            <span className="label-mono text-[var(--color-muted-foreground)]">
              Write a review
            </span>
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
              className="label-mono mt-4 inline-flex items-center gap-2 bg-[var(--color-accent)] px-6 py-3 text-[var(--color-accent-foreground)] transition-transform active:scale-[0.98]"
            >
              Submit Review
            </button>
          </form>

          {/* Review list */}
          <div className="mt-10 divide-y divide-[var(--color-border)]">
            {visibleReviews.length === 0 && (
              <p className="py-6 text-sm text-[var(--color-muted-foreground)]">
                No reviews yet. Be the first to leave one.
              </p>
            )}
            {visibleReviews.map((r) => (
              <div key={r.id} className="py-5 first:pt-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 flex-shrink-0 place-items-center bg-[var(--color-foreground)] text-sm font-bold text-[var(--color-background)]">
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{r.name}</p>
                      <StarRating
                        rating={r.rating}
                        size={13}
                        showValue={false}
                      />
                    </div>
                  </div>
                  <span className="label-mono flex-shrink-0 text-[var(--color-muted-foreground)]">
                    {r.daysAgo === 0 ? "Just now" : `${r.daysAgo}d ago`}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
                  {r.comment}
                </p>
              </div>
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="label-mono inline-flex items-center gap-2 border border-[var(--color-foreground)] px-6 py-3 text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Loading...
                  </>
                ) : (
                  `Load More (${reviews.length - visibleCount} remaining)`
                )}
              </button>
            </div>
          )}
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
