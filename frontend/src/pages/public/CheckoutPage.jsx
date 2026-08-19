import { Link } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  Upload,
  Wallet,
  Banknote,
  Check,
  ShoppingBag,
  Eye,
  X,
  Store,
  Truck,
  MapPin,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import useAuth from "@/hooks/useAuth";
import { updateMyProfile } from "@/services/user.service";
import { createOrder } from "@/services/order.service";
import { uploadToCloudinary } from "@/services/upload.service";

const EWALLETS = [
  { id: "gcash", name: "GCash" },
  { id: "maya", name: "Maya" },
];

export function CheckoutPage() {
  const { items, count, subtotal, setQty, remove, formatPrice, clear } =
    useCart();
  const { user, isAuthenticated, fetchCurrentUser } = useAuth();
  const [method, setMethod] = useState("ewallet");
  const [wallet] = useState("gcash");
  const [delivery, setDelivery] = useState("pickup"); // "pickup" | "delivery"
  const [receipt, setReceipt] = useState(null); // { file, url, progress, uploading, receiptUrl }
  const [preview, setPreview] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");

  // Address missing on the account -> must set it before placing an order.
  const [addressDraft, setAddressDraft] = useState(user?.address ?? "");
  const [addressMsg, setAddressMsg] = useState(null); // { type, text }
  const [addressSaving, setAddressSaving] = useState(false);

  const needsAddress = Boolean(isAuthenticated && !user?.address?.trim());

  const total = subtotal;

  const canPlace =
    items.length > 0 &&
    !needsAddress &&
    (method === "cash" ||
      (method === "ewallet" &&
        receipt &&
        !receipt.uploading &&
        Boolean(receipt.receiptUrl)));

  async function handleSaveAddress(e) {
    e.preventDefault();
    const value = addressDraft.trim();
    if (!value) {
      setAddressMsg({ type: "error", text: "Please enter your address." });
      return;
    }
    setAddressSaving(true);
    setAddressMsg(null);
    try {
      await updateMyProfile({ address: value });
      await fetchCurrentUser();
      setAddressMsg({ type: "success", text: "Address saved." });
    } catch (err) {
      setAddressMsg({
        type: "error",
        text:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to save your address.",
      });
    } finally {
      setAddressSaving(false);
    }
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (receipt?.url) URL.revokeObjectURL(receipt.url);

    const url = URL.createObjectURL(file);
    setReceipt({ file, url, progress: 0, uploading: true, receiptUrl: null });
    setPlaceError("");

    try {
      const result = await uploadToCloudinary(
        file,
        "receipt",
        (loaded, total) => {
          setReceipt((curr) =>
            curr
              ? {
                  ...curr,
                  progress: Math.round((loaded / Math.max(total, 1)) * 100),
                }
              : curr,
          );
        },
      );
      setReceipt((curr) =>
        curr
          ? {
              ...curr,
              progress: 100,
              uploading: false,
              receiptUrl: result.secure_url,
            }
          : curr,
      );
    } catch (err) {
      setReceipt((curr) =>
        curr ? { ...curr, uploading: false, progress: 100 } : curr,
      );
      setPlaceError(
        `Receipt upload failed: ${err?.message ?? "Please try again."}`,
      );
    }
  }

  function removeReceipt() {
    if (receipt?.url) URL.revokeObjectURL(receipt.url);
    setReceipt(null);
    setPreview(false);
    setPlaceError("");
  }

  async function placeOrder() {
    if (!canPlace) return;
    setPlacing(true);
    setPlaceError("");
    try {
      const order = await createOrder({
        paymentMethod: method === "ewallet" ? "e-wallet" : "cash",
        deliveryMethod: delivery,
        items: items.map((it) => ({
          product: it.product.id,
          quantity: it.qty,
        })),
        receipts:
          method === "ewallet" && receipt?.receiptUrl
            ? [receipt.receiptUrl]
            : [],
      });
      clear();
      setPlaced(true);
    } catch (err) {
      setPlaceError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to place your order.",
      );
    } finally {
      setPlacing(false);
    }
  }

  if (placed) {
    return (
      <div className="kk-container py-20 text-center sm:py-32">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)]">
          <Check size={28} />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">
          Order placed
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Thank you for your purchase. We&apos;ll send a confirmation shortly.
        </p>
        <Link
          to="/products"
          className="label-mono mt-8 inline-block border border-foreground bg-foreground px-6 py-4 text-background"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="kk-container border-b border-border py-4">
        <Link
          to={"/"}
          className="label-mono inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} /> Back
        </Link>
      </div>

      {needsAddress && (
        <div className="border-b border-border bg-[var(--color-surface)]">
          <div className="kk-container py-6">
            <div className="flex flex-col gap-4 border border-destructive/50 bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <MapPin
                  size={20}
                  className="mt-0.5 shrink-0 text-destructive"
                />
                <div>
                  <p className="label-mono text-destructive">
                    Delivery address required
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You need to set your address before you can place an order.
                  </p>
                </div>
              </div>
              <form
                onSubmit={handleSaveAddress}
                className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"
              >
                <div className="relative flex-1 sm:w-80">
                  <MapPin
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    value={addressDraft}
                    onChange={(e) => {
                      setAddressDraft(e.target.value);
                      setAddressMsg(null);
                    }}
                    placeholder="Street, Barangay, City/Municipality, Province"
                    className="h-11 w-full border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-foreground"
                  />
                </div>
                <button
                  type="submit"
                  disabled={addressSaving}
                  className="label-mono shrink-0 bg-[var(--color-accent)] px-5 py-3 text-[var(--color-accent-foreground)] transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {addressSaving ? "Saving…" : "Save Address"}
                </button>
              </form>
            </div>
            {addressMsg && (
              <p
                className={`mt-2 text-sm ${
                  addressMsg.type === "error"
                    ? "text-destructive"
                    : "text-foreground"
                }`}
              >
                {addressMsg.text}
              </p>
            )}
          </div>
        </div>
      )}

      <section className="kk-container py-10 sm:py-14">
        <span className="label-mono text-[var(--color-accent)]">Checkout</span>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl md:text-5xl">
          Review your order
        </h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          {/* Left: Products + Delivery + Payment */}
          <div className="space-y-12">
            {/* Products */}
            <div>
              <h2 className="label-mono text-[var(--color-accent)]">
                Your Items
              </h2>
              <div className="mt-4 border border-border">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                    <ShoppingBag size={32} className="text-muted-foreground" />
                    <p className="mt-4 text-base text-muted-foreground">
                      Your cart is empty.
                    </p>
                    <Link
                      to="/products"
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
                        className="flex flex-col gap-4 border-b border-border p-4 last:border-b-0 sm:flex-row sm:items-center sm:p-5"
                      >
                        <img
                          src={
                            it.product.imageUrls?.[0]?.url ?? it.product.image
                          }
                          alt={it.product.variety ?? it.product.name}
                          className="h-24 w-24 flex-shrink-0 object-cover bg-[var(--color-neutral-warm)] sm:h-20 sm:w-20"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-semibold sm:text-lg">
                            {it.product.variety ?? it.product.name}
                          </h3>
                          <p className="label-mono mt-1 text-muted-foreground">
                            {formatPrice(it.product.price)} /{" "}
                            {(it.product.unit ?? it.product.weightKg)
                              ? "kg"
                              : "item"}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-4">
                            <div className="flex items-center border border-border">
                              <button
                                onClick={() =>
                                  setQty(it.product.id, it.qty - 1)
                                }
                                className="grid h-9 w-9 place-items-center hover:bg-[var(--color-neutral-warm)]"
                                aria-label="Decrease"
                              >
                                −
                              </button>
                              <span className="label-mono w-10 text-center">
                                {it.qty}
                              </span>
                              <button
                                onClick={() =>
                                  setQty(it.product.id, it.qty + 1)
                                }
                                className="grid h-9 w-9 place-items-center hover:bg-[var(--color-neutral-warm)]"
                                aria-label="Increase"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => remove(it.product.id)}
                              className="label-mono text-muted-foreground hover:text-foreground"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="text-right sm:min-w-[100px]">
                          <p className="text-base font-bold sm:text-lg">
                            {formatPrice(it.qty * it.product.price)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Delivery Method */}
            <div>
              <h2 className="label-mono text-[var(--color-accent)]">
                Delivery Method
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <MethodCard
                  active={delivery === "pickup"}
                  onClick={() => setDelivery("pickup")}
                  icon={<Store size={20} />}
                  title="Pickup"
                  desc="Collect at the farm or coop"
                />
                <MethodCard
                  active={delivery === "delivery"}
                  onClick={() => setDelivery("delivery")}
                  icon={<Truck size={20} />}
                  title="Delivery"
                  desc="Delivered to your address"
                />
              </div>

              {delivery === "delivery" && (
                <div className="mt-6 border border-border p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={18}
                      className="mt-0.5 shrink-0 text-[var(--color-accent)]"
                    />
                    <div>
                      <span className="label-mono text-muted-foreground">
                        Delivered to
                      </span>
                      <p className="mt-1 text-base font-semibold text-foreground">
                        {user?.address ||
                          "No address set yet — add one above to continue."}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Delivery fee is not included in the total below — it
                        will be assessed and{" "}
                        <span className="font-semibold text-foreground">
                          paid upon receiving
                        </span>{" "}
                        your order.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <h2 className="label-mono text-[var(--color-accent)]">
                Payment Method
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <MethodCard
                  active={method === "ewallet"}
                  onClick={() => setMethod("ewallet")}
                  icon={<Wallet size={20} />}
                  title="E-Wallet"
                  desc="GCash, Maya"
                />
                <MethodCard
                  active={method === "cash"}
                  onClick={() => setMethod("cash")}
                  icon={<Banknote size={20} />}
                  title="Cash Payment"
                  desc="Pay in person on pickup or delivery"
                />
              </div>

              {method === "ewallet" && (
                <div className="mt-6 border border-border p-5 sm:p-6">
                  <span className="label-mono text-muted-foreground">
                    Upload Payment Receipt
                  </span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Send {formatPrice(total)} to our{" "}
                    {EWALLETS.find((w) => w.id === wallet)?.name} account, then
                    upload your receipt below.
                  </p>

                  {!receipt ? (
                    <label
                      htmlFor="receipt"
                      className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-border bg-[var(--color-neutral-warm)] px-6 py-10 text-center hover:border-foreground"
                    >
                      <Upload size={24} className="text-muted-foreground" />
                      <p className="text-base font-semibold">
                        Click to upload receipt
                      </p>
                      <p className="label-mono text-muted-foreground">
                        PNG, JPG, or PDF up to 10MB
                      </p>
                      <input
                        id="receipt"
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={handleFile}
                      />
                    </label>
                  ) : (
                    <div className="mt-4 border border-border">
                      <div className="flex items-center gap-4 p-4">
                        {receipt.file.type.startsWith("image/") ? (
                          <img
                            src={receipt.url}
                            alt={receipt.file.name}
                            className="h-16 w-16 flex-shrink-0 object-cover"
                          />
                        ) : (
                          <div className="grid h-16 w-16 flex-shrink-0 place-items-center bg-[var(--color-neutral-warm)] text-xs font-bold text-muted-foreground">
                            PDF
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-base font-semibold">
                              {receipt.file.name}
                            </p>
                            {!receipt.uploading && (
                              <Check
                                size={18}
                                className="flex-shrink-0 text-[var(--color-accent)]"
                              />
                            )}
                          </div>
                          <p className="label-mono mt-1 text-muted-foreground">
                            {(receipt.file.size / 1024).toFixed(1)} KB
                            {receipt.uploading
                              ? ` · Uploading ${Math.round(receipt.progress)}%`
                              : " · Uploaded"}
                          </p>
                          <div className="mt-2 h-1.5 w-full overflow-hidden bg-[var(--color-neutral-warm)]">
                            <div
                              className="h-full bg-[var(--color-accent)] transition-all duration-200"
                              style={{ width: `${receipt.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex border-t border-border">
                        {receipt.file.type.startsWith("image/") &&
                          !receipt.uploading && (
                            <button
                              type="button"
                              onClick={() => setPreview(true)}
                              className="label-mono flex flex-1 items-center justify-center gap-2 border-r border-border px-4 py-3 hover:bg-[var(--color-neutral-warm)]"
                            >
                              <Eye size={14} /> View
                            </button>
                          )}
                        <label
                          htmlFor="receipt"
                          className="label-mono flex flex-1 cursor-pointer items-center justify-center gap-2 border-r border-border px-4 py-3 hover:bg-[var(--color-neutral-warm)]"
                        >
                          <Upload size={14} /> Replace
                          <input
                            id="receipt"
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={handleFile}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={removeReceipt}
                          className="label-mono flex flex-1 items-center justify-center gap-2 px-4 py-3 text-muted-foreground hover:bg-[var(--color-neutral-warm)] hover:text-foreground"
                        >
                          <X size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  )}
                  {placeError && (
                    <p className="mt-3 text-sm text-[var(--color-destructive)]">
                      {placeError}
                    </p>
                  )}
                </div>
              )}

              {method === "cash" && (
                <div className="mt-6 border border-border p-5 text-base text-muted-foreground sm:p-6">
                  Pay{" "}
                  <span className="font-semibold text-foreground">
                    {formatPrice(total)}
                  </span>{" "}
                  in cash on pickup or delivery.
                </div>
              )}
            </div>
          </div>

          {/* Right: Summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-border bg-[var(--color-surface)] p-6">
              <h2 className="label-mono text-[var(--color-accent)]">
                Order Summary
              </h2>
              <dl className="mt-5 space-y-3">
                <Row label="Total Items" value={String(count)} />
                <Row label="Subtotal" value={formatPrice(subtotal)} />
                <div className="border-t border-border pt-3">
                  <Row label="Total" value={formatPrice(total)} bold />
                </div>
              </dl>

              {delivery === "delivery" && (
                <p className="label-mono mt-3 text-muted-foreground">
                  + delivery fee, payable upon receiving
                </p>
              )}

              <button
                onClick={placeOrder}
                disabled={!canPlace || placing}
                className="label-mono mt-6 w-full bg-[var(--color-accent)] px-5 py-4 text-[var(--color-accent-foreground)] transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placing ? "Placing order…" : "Place Order"}
              </button>
              {placeError && (
                <p className="mt-3 text-center text-sm text-[var(--color-destructive)]">
                  {placeError}
                </p>
              )}
              <Link
                to="/products"
                className="label-mono mt-2 block w-full border border-border px-5 py-4 text-center text-foreground hover:bg-[var(--color-neutral-warm)]"
              >
                Continue Shopping
              </Link>

              {method === "ewallet" && !receipt && items.length > 0 && (
                <p className="label-mono mt-4 text-center text-muted-foreground">
                  Upload your receipt to place the order.
                </p>
              )}
            </div>
          </aside>
        </div>
      </section>

      {preview && receipt?.url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-4"
          onClick={() => setPreview(false)}
        >
          <button
            type="button"
            onClick={() => setPreview(false)}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center border border-background/30 bg-background text-foreground"
            aria-label="Close preview"
          >
            <X size={18} />
          </button>
          <img
            src={receipt.url}
            alt={receipt.file.name}
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function MethodCard({ active, onClick, icon, title, desc }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-4 border p-5 text-left transition-colors ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border hover:bg-[var(--color-neutral-warm)]"
      }`}
    >
      <span
        className={`grid h-10 w-10 flex-shrink-0 place-items-center border ${
          active ? "border-background/30" : "border-border"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-base font-bold">{title}</span>
        <span
          className={`label-mono mt-1 block ${
            active ? "text-background/70" : "text-muted-foreground"
          }`}
        >
          {desc}
        </span>
      </span>
    </button>
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
      <dd className={bold ? "text-lg font-bold" : "text-base"}>{value}</dd>
    </div>
  );
}
