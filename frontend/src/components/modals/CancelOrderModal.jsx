import { useState } from "react";
import { CircleX, X } from "lucide-react";
import { Button, IconButton } from "@/components/ui";

export function CancelOrderModal({ order, isKaluppa = false, isPending = false, onClose, onConfirm }) {
  if (!order) return null;

  const [remarks, setRemarks] = useState("");
  const refNumber = order.referenceNumber || order.ref || "Order";
  const wasReserved = order.status === "reserved";

  const canSubmit = isKaluppa ? remarks.trim().length > 0 : true;

  const handleConfirm = () => {
    if (!canSubmit) return;
    onConfirm(remarks.trim() ? { remarks: remarks.trim() } : {});
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
            <CircleX className="h-5 w-5 text-destructive" />
            Cancel Order
          </h2>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <div className="px-6 py-5 text-sm">
          <p className="text-muted-foreground">
            You're about to cancel order{" "}
            <span className="font-semibold text-foreground">{refNumber}</span>.
            This action cannot be undone.
          </p>

          {isKaluppa ? (
            <>
              {wasReserved && (
                <div className="mt-3 rounded border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
                  Because this order was reserved, cancelling it will automatically restore the item quantities back into your product inventory stock.
                </div>
              )}
              <label className="mt-4 flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">
                  Cancellation Remarks / Reason{" "}
                  <span className="text-destructive">*</span>
                </span>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Explain why this order is being cancelled. This message will be emailed directly to the customer."
                  rows={4}
                  className="w-full resize-none border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground"
                />
              </label>
              <p className="mt-1 text-xs text-muted-foreground">
                An <strong>Order Cancelled</strong> email containing these remarks will be sent to the customer immediately.
              </p>
            </>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              Orders can only be cancelled while status is pending and within 1 hour of placing the order.
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-6 py-3">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Keep Order
          </Button>
          <Button
            variant="destructive"
            disabled={!canSubmit || isPending}
            onClick={handleConfirm}
            className="gap-2"
          >
            <CircleX className="h-4 w-4" />
            {isPending ? "Cancelling…" : "Confirm Cancellation"}
          </Button>
        </div>
      </div>
    </div>
  );
}
