import { useState } from "react";
import { CircleX, X } from "lucide-react";
import { Button, IconButton } from "@/components/ui";

export function CancelOrderModal({ order, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const canSubmit = reason.trim().length > 0;

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
            Cancel order
          </h2>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <div className="px-6 py-5 text-sm">
          <p className="text-muted-foreground">
            You're about to cancel order{" "}
            <span className="font-semibold text-foreground">{order.ref}</span>.
            This action can't be undone.
          </p>
          <label className="mt-4 flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Reason for cancellation{" "}
              <span className="text-destructive">*</span>
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Customer requested cancellation, out of stock, payment failed…"
              rows={4}
              className="w-full resize-none border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground"
            />
          </label>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-6 py-3">
          <Button variant="outline" onClick={onClose}>
            Keep order
          </Button>
          <Button
            variant="destructive"
            disabled={!canSubmit}
            onClick={() => canSubmit && onConfirm(reason.trim())}
            className="gap-2"
          >
            <CircleX className="h-4 w-4" /> Confirm cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
