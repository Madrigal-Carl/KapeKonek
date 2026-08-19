import { useState } from "react";
import {
  AlertCircle,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Phone,
  Receipt,
  Truck,
  User,
  X,
  ZoomIn,
} from "lucide-react";
import { Button, IconButton } from "@/components/ui";
import { MethodBadge, StatusPill } from "@/components/dashboard";
import { fmtPrice } from "@/utils/format";

export function OrderDetailsModal({ order, onClose }) {
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  if (!order) return null;

  const refNumber = order.referenceNumber || order.ref || "Order";
  const customerName =
    order.customer?.fullName ||
    (typeof order.customer === "string" ? order.customer : "Anonymous Customer");
  const customerEmail = order.customer?.email || "—";
  const customerPhone =
    order.customer?.contactNumber ||
    order.customer?.phoneNumber ||
    "—";
  const paymentMethod = order.paymentMethod || order.method || "cash";
  const deliveryMethod = order.deliveryMethod || "pickup";
  const status = order.status || "pending";
  const items = order.orderedProducts || order.items || [];
  const totalPrice =
    typeof order.totalPrice === "number" ? order.totalPrice : order.total || 0;
  const deliveryFee = order.deliveryFee;
  const isDelivery = deliveryMethod === "delivery";
  const finalTotal =
    isDelivery && deliveryFee != null ? totalPrice + deliveryFee : totalPrice;

  const dateFormatted = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const timeFormatted = order.createdAt
    ? new Date(order.createdAt).toLocaleTimeString("en-PH", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const receipts = order.receipts || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" />

      {/* Modal Card */}
      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold tracking-tight text-muted-foreground">
                #{refNumber}
              </span>
              <StatusPill status={status} />
            </div>
            <p className="text-xs text-muted-foreground">
              Placed on {dateFormatted} {timeFormatted && `at ${timeFormatted}`}
            </p>
          </div>
          <IconButton
            icon={X}
            label="Close order details"
            onClick={onClose}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          />
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto">
          <div className="space-y-6 p-6">
            {/* Cancellation Alert */}
            {status === "cancelled" && order.remarks && (
              <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900/50 dark:bg-rose-950/20">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <div>
                  <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                    Cancellation Reason / Remarks
                  </p>
                  <p className="text-sm text-rose-700 dark:text-rose-300/90">
                    {order.remarks}
                  </p>
                </div>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Customer Details */}
              <section className="rounded-lg border border-border bg-card p-5">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-accent">
                    <User className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Customer Details
                  </h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground">Customer Name</span>
                    <span className="font-medium text-foreground">{customerName}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground">Email</span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      {customerEmail}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground">Contact Number</span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {customerPhone}
                    </span>
                  </div>
                </div>
              </section>

              {/* Payment & Fulfillment */}
              <section className="rounded-lg border border-border bg-card p-5">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-accent">
                    <Truck className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Payment & Fulfillment
                  </h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                      <MethodBadge method={paymentMethod} type="payment" />
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Delivery Method</span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <MethodBadge method={deliveryMethod} type="delivery" />
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-medium text-foreground">
                      {isDelivery
                        ? deliveryFee != null
                          ? fmtPrice(deliveryFee)
                          : "Pending calculation"
                        : "None (Pickup)"}
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* Order Items */}
            <section className="rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <Package className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold text-foreground">
                  Order Items ({items.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium text-muted-foreground">Item</th>
                      <th className="px-5 py-3 text-right font-medium text-muted-foreground">Price</th>
                      <th className="px-5 py-3 text-center font-medium text-muted-foreground">Qty</th>
                      <th className="px-5 py-3 text-right font-medium text-muted-foreground">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((it, idx) => {
                      const qty = it.quantity || it.qty || 1;
                      const price = it.price || 0;
                      const lineTotal = qty * price;

                      return (
                        <tr key={idx} className="transition-colors hover:bg-muted/30">
                          <td className="px-5 py-3 font-medium text-foreground">{it.name}</td>
                          <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                            {fmtPrice(price)}
                          </td>
                          <td className="px-5 py-3 text-center text-foreground">{qty}</td>
                          <td className="px-5 py-3 text-right font-medium tabular-nums text-foreground">
                            {fmtPrice(lineTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-border px-5 py-4">
                <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Items Subtotal</span>
                    <span className="tabular-nums">{fmtPrice(totalPrice)}</span>
                  </div>
                  {isDelivery && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Delivery Fee</span>
                      <span className="tabular-nums">
                        {deliveryFee != null ? fmtPrice(deliveryFee) : "₱0.00"}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
                    <span>Total Amount</span>
                    <span className="tabular-nums">{fmtPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Receipts */}
            {receipts.length > 0 && (
              <section className="rounded-lg border border-border bg-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-accent" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Payment Receipts ({receipts.length})
                    </h3>
                  </div>
                  <span className="text-xs text-muted-foreground">Click to inspect</span>
                </div>

                {receipts.length === 1 ? (
                  <button
                    type="button"
                    onClick={() => setSelectedReceipt(receipts[0])}
                    className="group flex w-full max-w-sm cursor-pointer items-center gap-4 rounded-lg border border-border bg-muted/15 p-3 text-left transition-all hover:border-foreground/30 hover:bg-muted/30"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                      <img
                        src={receipts[0]}
                        alt="Payment receipt thumbnail"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                        <ZoomIn className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Payment Receipt Attached</p>
                      <p className="text-xs text-muted-foreground">Click image to inspect full-size proof of payment.</p>
                    </div>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {receipts.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedReceipt(url)}
                        className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-lg border border-border bg-muted/15 text-left transition-all hover:border-foreground/30 hover:shadow-md"
                      >
                        <img
                          src={url}
                          alt={`Payment receipt ${i + 1}`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                          <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                            <ZoomIn className="h-3 w-3" />
                            Inspect
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Total
            <span className="ml-2 text-lg font-bold text-foreground">{fmtPrice(finalTotal)}</span>
          </div>
          <Button onClick={onClose} variant="outline" className="min-w-[100px]">
            Close
          </Button>
        </div>
      </div>

      {/* Receipt Lightbox */}
      {selectedReceipt && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={() => setSelectedReceipt(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-lg bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute right-3 top-3 z-10">
              <IconButton
                icon={X}
                label="Close receipt preview"
                onClick={() => setSelectedReceipt(null)}
              />
            </div>
            <img
              src={selectedReceipt}
              alt="Payment receipt full size"
              className="max-h-[85vh] w-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
