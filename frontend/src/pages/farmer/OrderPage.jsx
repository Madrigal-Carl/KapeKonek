import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Eye,
  Search,
  X,
  Wallet,
  Banknote,
  CircleDashed,
  Bookmark,
  CircleCheck,
  CircleX,
} from "lucide-react";
import { IconButton, Button } from "@/components/ui";
import receipt1 from "@/assets/images/receipt-sample-1.jpg";
import receipt2 from "@/assets/images/receipt-sample-2.jpg";

const SEED = [
  {
    ref: "OR-1001",
    customer: "Maria Santos",
    method: "e-wallet",
    total: 1250,
    status: "pending",
    createdAt: "2025-06-24",
    items: [
      { name: "Arabica Green Beans", qty: 2, price: 500 },
      { name: "Ground Liberica", qty: 1, price: 250 },
    ],
  },
  {
    ref: "OR-1002",
    customer: "Juan Dela Cruz",
    method: "cash",
    total: 480,
    status: "reserved",
    createdAt: "2025-06-25",
    items: [{ name: "Coffee Seedlings (Excelsa)", qty: 4, price: 120 }],
  },
  {
    ref: "OR-1003",
    customer: "Ana Reyes",
    method: "e-wallet",
    total: 2100,
    status: "completed",
    createdAt: "2025-06-20",
    items: [{ name: "Robusta Roasted Medium", qty: 3, price: 700 }],
  },
  {
    ref: "OR-1004",
    customer: "Paolo Mercado",
    method: "cash",
    total: 350,
    status: "cancelled",
    createdAt: "2025-06-18",
    items: [{ name: "Ground Liberica", qty: 1, price: 350 }],
    cancelReason: "Customer changed mind",
  },
  {
    ref: "OR-1005",
    customer: "Liza Bautista",
    method: "e-wallet",
    total: 900,
    status: "pending",
    createdAt: "2025-06-26",
    items: [{ name: "Arabica Green Beans", qty: 3, price: 300 }],
  },
  {
    ref: "OR-1006",
    customer: "Carlos Yu",
    method: "cash",
    total: 1600,
    status: "reserved",
    createdAt: "2025-06-22",
    items: [{ name: "Robusta Roasted Medium", qty: 2, price: 800 }],
  },
  {
    ref: "OR-1007",
    customer: "Grace Lim",
    method: "e-wallet",
    total: 540,
    status: "completed",
    createdAt: "2025-06-15",
    items: [{ name: "Coffee Seedlings (Excelsa)", qty: 6, price: 90 }],
  },
];

const STATUS_META = {
  pending: {
    label: "Pending",
    icon: CircleDashed,
    border: "border-amber-500",
    dot: "bg-amber-500",
    text: "text-amber-700",
  },
  reserved: {
    label: "Reserved",
    icon: Bookmark,
    border: "border-sky-500",
    dot: "bg-sky-500",
    text: "text-sky-700",
  },
  completed: {
    label: "Completed",
    icon: CircleCheck,
    border: "border-emerald-500",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
  cancelled: {
    label: "Cancelled",
    icon: CircleX,
    border: "border-destructive",
    dot: "bg-destructive",
    text: "text-destructive",
  },
};

function StatusPill({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 border-l-2 bg-muted/60 px-2.5 py-1 text-xs font-semibold",
        meta.border,
        meta.text,
      ].join(" ")}
    >
      <span className={["h-1.5 w-1.5", meta.dot].join(" ")} />
      {meta.label}
    </span>
  );
}

function MethodBadge({ method }) {
  const isEwallet = method === "e-wallet";
  const Icon = isEwallet ? Wallet : Banknote;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
      <Icon className="h-4 w-4 text-muted-foreground" />
      {isEwallet ? "E-wallet" : "Cash"}
    </span>
  );
}

function formatPeso(n) {
  return `₱${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function OrderPage() {
  const [rows, setRows] = useState(SEED);
  const [view, setView] = useState(null);
  const [completeDialog, setCompleteDialog] = useState(null); // { order }
  const [cancelDialog, setCancelDialog] = useState(null); // { order }

  const updateStatus = (ref, patch) => {
    setRows((r) => r.map((x) => (x.ref === ref ? { ...x, ...patch } : x)));
  };

  return (
    <div className="py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div className="min-w-0">
          <p className="label-mono mb-2 text-accent">Marketplace</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track incoming orders, mark them as reserved or completed, and
            handle cancellations.
          </p>
        </div>
      </div>

      <DataTable
        rows={rows}
        onView={(o) => setView(o)}
        onComplete={(o) => setCompleteDialog({ order: o })}
        onCancel={(o) => setCancelDialog({ order: o })}
      />

      {view && <ViewOrderModal order={view} onClose={() => setView(null)} />}

      {completeDialog && (
        <StatusDialog
          order={completeDialog.order}
          onClose={() => setCompleteDialog(null)}
          onSelect={(next) => {
            updateStatus(completeDialog.order.ref, { status: next });
            setCompleteDialog(null);
          }}
        />
      )}

      {cancelDialog && (
        <CancelDialog
          order={cancelDialog.order}
          onClose={() => setCancelDialog(null)}
          onConfirm={(reason) => {
            updateStatus(cancelDialog.order.ref, {
              status: "cancelled",
              cancelReason: reason,
            });
            setCancelDialog(null);
          }}
        />
      )}
    </div>
  );
}

function DataTable({ rows, onView, onComplete, onCancel }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filtered = useMemo(() => {
    let r = rows;
    if (query) {
      const q = query.toLowerCase();
      r = r.filter(
        (x) =>
          x.ref.toLowerCase().includes(q) ||
          (x.customer ?? "").toLowerCase().includes(q) ||
          x.method.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") r = r.filter((x) => x.status === statusFilter);
    return r;
  }, [rows, query, statusFilter]);

  useEffect(() => setPage(1), [query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="border border-border bg-card">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by reference, customer, or payment…"
            className="w-full border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground"
          />
        </div>
        <div className="relative w-full min-w-[160px] sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full appearance-none border border-border bg-background py-2.5 pl-3 pr-9 text-sm text-foreground outline-none focus:border-foreground"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reserved">Reserved</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="relative w-full overflow-auto">
        <table className="w-full min-w-[820px] caption-bottom border-collapse text-sm">
          <thead className="bg-muted/60">
            <tr>
              {[
                "Reference #",
                "Payment Method",
                "Total Price",
                "Status",
                "",
              ].map((l, i) => (
                <th
                  key={i}
                  className={[
                    "label-mono px-4 py-3 text-left text-muted-foreground",
                    l === "" && "text-right",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center border border-border bg-muted">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="font-semibold text-foreground">
                    No orders found
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search or filters.
                  </div>
                </td>
              </tr>
            ) : (
              paged.map((r) => {
                const isFinal =
                  r.status === "completed" || r.status === "cancelled";
                return (
                  <tr
                    key={r.ref}
                    className="border-t border-border transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground">
                        {r.ref}
                      </div>
                      <div className="label-mono text-muted-foreground">
                        {r.customer}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <MethodBadge method={r.method} />
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-foreground">
                      {formatPeso(r.total)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          icon={Eye}
                          label="View"
                          onClick={() => onView(r)}
                        />
                        <IconButton
                          icon={Check}
                          label={
                            r.status === "reserved"
                              ? "Mark as completed"
                              : "Mark as completed or reserved"
                          }
                          onClick={() => onComplete(r)}
                          disabled={isFinal}
                          className={
                            isFinal ? "opacity-40 cursor-not-allowed" : ""
                          }
                        />
                        <IconButton
                          icon={X}
                          label="Cancel order"
                          tone="danger"
                          onClick={() => onCancel(r)}
                          disabled={isFinal}
                          className={
                            isFinal ? "opacity-40 cursor-not-allowed" : ""
                          }
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3 text-sm">
        <div className="text-muted-foreground">
          Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–
          {Math.min(page * pageSize, filtered.length)} of {filtered.length}
        </div>
        <div className="flex items-center gap-1">
          <IconButton
            icon={ChevronLeft}
            label="Previous"
            onClick={() => setPage(Math.max(1, page - 1))}
          />
          <span className="px-3 font-semibold text-foreground">
            {page} / {totalPages}
          </span>
          <IconButton
            icon={ChevronRight}
            label="Next"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
          />
        </div>
      </div>
    </div>
  );
}

function ModalShell({ children, onClose, maxWidth = "max-w-md" }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-40 p-4"
      onClick={onClose}
    >
      <div
        className={`relative flex max-h-[90vh] w-full ${maxWidth} flex-col overflow-hidden border border-border bg-card shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ViewOrderModal({ order, onClose }) {
  return (
    <ModalShell onClose={onClose} maxWidth="max-w-2xl">
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
                {formatPeso(it.qty * it.price)}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3 text-base">
          <span className="font-semibold text-foreground">Total</span>
          <span className="font-semibold text-foreground">
            {formatPeso(order.total)}
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
    </ModalShell>
  );
}

function StatusDialog({ order, onClose, onSelect }) {
  const isReserved = order.status === "reserved";
  return (
    <ModalShell onClose={onClose}>
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
          <span className="font-semibold text-foreground">{order.ref}</span> is
          currently{" "}
          <span className="font-semibold text-foreground">
            {STATUS_META[order.status].label}
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
    </ModalShell>
  );
}

function CancelDialog({ order, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const canSubmit = reason.trim().length > 0;
  return (
    <ModalShell onClose={onClose}>
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
            Reason for cancellation <span className="text-destructive">*</span>
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
    </ModalShell>
  );
}
