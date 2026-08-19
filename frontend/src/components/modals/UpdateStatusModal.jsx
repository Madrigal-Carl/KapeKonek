import { useState } from "react";
import { Bookmark, CircleCheck, X } from "lucide-react";
import { Button, Field, IconButton, TextInput } from "@/components/ui";

export function UpdateStatusModal({
  order,
  onClose,
  onReserve,
  onComplete,
  isPending,
}) {
  if (!order) return null;

  const isPendingStatus = order.status === "pending";
  const isReservedStatus = order.status === "reserved";
  const isDelivery = order.deliveryMethod === "delivery";
  const refNumber = order.referenceNumber || order.ref || "Order";

  const [deliveryFee, setDeliveryFee] = useState(
    order.deliveryFee != null ? String(order.deliveryFee) : "",
  );

  const feeIsValid =
    !isDelivery ||
    !isPendingStatus ||
    (deliveryFee.trim() !== "" && !isNaN(Number(deliveryFee)) && Number(deliveryFee) >= 0);

  const handleReserve = () => {
    if (!feeIsValid) return;
    const payload = isDelivery && deliveryFee.trim() !== ""
      ? { deliveryFee: Number(deliveryFee) }
      : {};
    onReserve(order._id, payload);
  };

  const handleComplete = () => {
    onComplete(order._id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-40 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            {isPendingStatus ? (
              <>
                <Bookmark className="h-5 w-5 text-accent" />
                Reserve Order
              </>
            ) : (
              <>
                <CircleCheck className="h-5 w-5 text-accent" />
                Complete Order
              </>
            )}
          </h2>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 text-sm text-muted-foreground">
          {isPendingStatus && (
            <div className="space-y-3">
              <p>
                Order <span className="font-semibold text-foreground">{refNumber}</span> is currently <span className="font-semibold text-foreground uppercase">Pending</span>.
              </p>
              <p className="text-xs text-muted-foreground">
                Reserving will deduct item quantities from your inventory stock and send an <strong>Order Reserved</strong> notice email to the customer.
              </p>

              {isDelivery && (
                <div className="mt-4 pt-2">
                  <Field label="Delivery Fee (₱)">
                    <TextInput
                      type="number"
                      min="0"
                      step="0.01"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(e.target.value)}
                      placeholder="e.g. 150.00"
                    />
                  </Field>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This order is for delivery. Enter the delivery fee to include in the customer's reservation email.
                  </p>
                </div>
              )}
            </div>
          )}

          {isReservedStatus && (
            <div className="space-y-2">
              <p>
                Order <span className="font-semibold text-foreground">{refNumber}</span> is currently <span className="font-semibold text-foreground uppercase">Reserved</span>.
              </p>
              <p className="text-xs text-muted-foreground">
                Confirm that this order has been fully fulfilled and delivered or collected by the customer. An <strong>Order Completed</strong> email will be sent automatically.
              </p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-6 py-3">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Close
          </Button>

          {isPendingStatus && (
            <Button
              onClick={handleReserve}
              disabled={!feeIsValid || isPending}
              className="gap-2"
            >
              <Bookmark className="h-4 w-4" />
              {isPending ? "Reserving…" : "Mark as Reserved"}
            </Button>
          )}

          {isReservedStatus && (
            <Button
              onClick={handleComplete}
              disabled={isPending}
              className="gap-2"
            >
              <CircleCheck className="h-4 w-4" />
              {isPending ? "Completing…" : "Mark as Completed"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
