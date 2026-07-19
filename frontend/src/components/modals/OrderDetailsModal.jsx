import { X } from "lucide-react";
import { Button, IconButton } from "@/components/ui";
import { MethodBadge, StatusPill } from "@/components/dashboard";
import { fmtPrice } from "@/utils/format";
import receipt1 from "@/assets/images/receipt-sample-1.jpg";
import receipt2 from "@/assets/images/receipt-sample-2.jpg";

export function OrderDetailsModal({ order, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-40 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="label-mono mb-1 text-accent">Order</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {order.ref}
            </h2>
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 text-sm">
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <p className="label-mono mb-1 text-muted-foreground">Customer</p>
              <p className="font-medium text-foreground">{order.customer}</p>
            </div>
            <div>
              <p className="label-mono mb-1 text-muted-foreground">Date</p>
              <p className="font-medium text-foreground">{order.createdAt}</p>
            </div>
            <div>
              <p className="label-mono mb-1 text-muted-foreground">Payment</p>
              <MethodBadge method={order.method} />
            </div>
            <div>
              <p className="label-mono mb-1 text-muted-foreground">Status</p>
              <StatusPill status={order.status} />
            </div>
          </div>

          <p className="label-mono mb-2 text-muted-foreground">Items</p>
          <div className="mb-4 border border-border">
            {order.items.map((it, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border px-3 py-2 last:border-b-0"
              >
                <div>
                  <div className="font-medium text-foreground">{it.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Qty {it.qty}
                  </div>
                </div>
                <div className="font-semibold text-foreground">
                  {fmtPrice(it.qty * it.price)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3 text-base">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-semibold text-foreground">
              {fmtPrice(order.total)}
            </span>
          </div>

          <div className="mt-5">
            <p className="label-mono mb-2 text-muted-foreground">
              Receipt / Proof of Payment
            </p>
            <div className="grid grid-cols-2 gap-3">
              <img
                src={receipt1}
                alt="Receipt sample 1"
                className="h-auto w-full border border-border object-cover"
                loading="lazy"
                width={512}
                height={1024}
              />
              <img
                src={receipt2}
                alt="Receipt sample 2"
                className="h-auto w-full border border-border object-cover"
                loading="lazy"
                width={512}
                height={1024}
              />
            </div>
          </div>

          {order.status === "cancelled" && order.cancelReason ? (
            <div className="mt-4 border-l-2 border-destructive bg-destructive/5 px-3 py-2 text-sm">
              <p className="label-mono mb-1 text-destructive">Cancel reason</p>
              <p className="text-foreground">{order.cancelReason}</p>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-6 py-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
