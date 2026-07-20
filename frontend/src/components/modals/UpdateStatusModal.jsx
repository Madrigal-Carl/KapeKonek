import { useState } from "react";
import { Bookmark, Check, CircleCheck, X } from "lucide-react";
import { Button, Field, IconButton, TextInput } from "@/components/ui";

const STATUS_LABEL = {
  pending: "Pending",
  reserved: "Reserved",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function UpdateStatusModal({ order, onClose, onSelect }) {
  const isReserved = order.status === "reserved";
  const needsDeliveryFee = !isReserved && order.deliveryMethod === "delivery";

  const [deliveryFee, setDeliveryFee] = useState(
    order.deliveryFee != null ? String(order.deliveryFee) : "",
  );

  const feeIsValid =
    !needsDeliveryFee ||
    (deliveryFee.trim() !== "" && Number(deliveryFee) >= 0);

  const handleSelect = (next) => {
    if (!feeIsValid) return;
    const extra = needsDeliveryFee
      ? { deliveryFee: Number(deliveryFee) }
      : undefined;
    onSelect(next, extra);
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
            <Check className="h-5 w-5 text-accent" />
            Update order status
          </h2>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <div className="px-6 py-5 text-sm text-muted-foreground">
          <p>
            Order{" "}
            <span className="font-semibold text-foreground">{order.ref}</span>{" "}
            is currently{" "}
            <span className="font-semibold text-foreground">
              {STATUS_LABEL[order.status]}
            </span>
            .
          </p>
          <p className="mt-2">
            {isReserved
              ? "Confirm this order has been fulfilled and paid for."
              : "Choose to mark this order as reserved (held for the customer) or fully completed."}
          </p>

          {needsDeliveryFee && (
            <div className="mt-4">
              <Field label="Delivery Fee (₱)">
                <TextInput
                  type="number"
                  min="0"
                  step="0.01"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  placeholder="e.g. 150"
                />
              </Field>
              <p className="mt-1.5 text-xs text-muted-foreground">
                This order is for delivery — enter the delivery fee before
                reserving or completing it.
              </p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-nowrap items-center justify-end gap-2 border-t border-border px-6 py-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!isReserved && (
            <Button
              variant="secondary"
              onClick={() => handleSelect("reserved")}
              disabled={!feeIsValid}
              className="gap-2"
            >
              <Bookmark className="h-4 w-4" /> Reserve
            </Button>
          )}
          <Button
            onClick={() => handleSelect("completed")}
            disabled={!feeIsValid}
            className="gap-2"
          >
            <CircleCheck className="h-4 w-4" /> Complete
          </Button>
        </div>
      </div>
    </div>
  );
}
