import { Bookmark, Check, CircleCheck, X } from "lucide-react";
import { Button, IconButton } from "@/components/ui";

const STATUS_LABEL = {
  pending: "Pending",
  reserved: "Reserved",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function UpdateStatusModal({ order, onClose, onSelect }) {
  const isReserved = order.status === "reserved";
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
        </div>

        <div className="flex shrink-0 flex-nowrap items-center justify-end gap-2 border-t border-border px-6 py-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!isReserved && (
            <Button
              variant="secondary"
              onClick={() => onSelect("reserved")}
              className="gap-2"
            >
              <Bookmark className="h-4 w-4" /> Reserve
            </Button>
          )}
          <Button onClick={() => onSelect("completed")} className="gap-2">
            <CircleCheck className="h-4 w-4" /> Complete
          </Button>
        </div>
      </div>
    </div>
  );
}
