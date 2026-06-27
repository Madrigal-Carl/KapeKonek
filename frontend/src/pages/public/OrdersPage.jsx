import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Wallet,
  Banknote,
  Search,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";

const STATUS_META = {
  pending: {
    label: "Pending",
    dot: "bg-[var(--chart-5)]",
    text: "text-[var(--chart-5)]",
  },
  reserved: {
    label: "Reserved",
    dot: "bg-[var(--chart-1)]",
    text: "text-[var(--chart-1)]",
  },
  completed: {
    label: "Completed",
    dot: "bg-[var(--color-accent)]",
    text: "text-[var(--color-accent)]",
  },
};

const STATUS_FILTERS = ["all", "pending", "reserved", "completed"];

const ORDERS = [
  {
    id: "ORD-1042",
    status: "pending",
    paymentMethod: "E-Wallet",
    items: [
      { name: "Arabica Beans (250g)", price: 320, quantity: 2 },
      { name: "Robusta Beans (250g)", price: 280, quantity: 1 },
    ],
  },
  {
    id: "ORD-1038",
    status: "reserved",
    paymentMethod: "Cash",
    items: [{ name: "Civet Coffee (100g)", price: 950, quantity: 1 }],
  },
  {
    id: "ORD-1029",
    status: "completed",
    paymentMethod: "E-Wallet",
    items: [
      { name: "Liberica Beans (250g)", price: 310, quantity: 3 },
      { name: "Drip Bags (Pack of 10)", price: 250, quantity: 1 },
    ],
  },
  {
    id: "ORD-1021",
    status: "completed",
    paymentMethod: "Cash",
    items: [{ name: "Excelsa Beans (250g)", price: 295, quantity: 2 }],
  },
  {
    id: "ORD-1015",
    status: "pending",
    paymentMethod: "E-Wallet",
    items: [
      { name: "Arabica Beans (500g)", price: 580, quantity: 1 },
      { name: "Drip Bags (Pack of 10)", price: 250, quantity: 2 },
    ],
  },
  {
    id: "ORD-1009",
    status: "reserved",
    paymentMethod: "Cash",
    items: [{ name: "Robusta Beans (1kg)", price: 980, quantity: 1 }],
  },
  {
    id: "ORD-1003",
    status: "completed",
    paymentMethod: "E-Wallet",
    items: [{ name: "Civet Coffee (100g)", price: 950, quantity: 2 }],
  },
];

const PAGE_SIZE = 4;

function getOrderTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getItemCount(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export default function OrdersPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const lifetimeTotal = ORDERS.reduce(
    (sum, o) => sum + getOrderTotal(o.items),
    0,
  );

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();

    return ORDERS.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      const matchesQuery =
        q === "" ||
        order.id.toLowerCase().includes(q) ||
        order.items.some((item) => item.name.toLowerCase().includes(q));

      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function handleQueryChange(value) {
    setQuery(value);
    setPage(1);
  }

  function handleStatusChange(value) {
    setStatusFilter(value);
    setPage(1);
  }

  return (
    <div className="kk-container py-10 sm:py-14">
      {/* Back nav */}
      <Link
        to="/"
        className="label-mono inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back to home
      </Link>

      {/* Header */}
      <div className="mt-6 flex flex-col gap-6 sm:mt-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="label-mono text-[var(--color-accent)]">Account</span>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            Your orders
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {ORDERS.length} orders · track status and review what you bought.
          </p>
        </div>

        <div className="flex gap-6 border-t border-border pt-4 sm:gap-10 sm:border-t-0 sm:pt-0 sm:text-right">
          <div>
            <p className="label-mono text-muted-foreground">Lifetime spend</p>
            <p className="mt-1.5 text-2xl font-extrabold">
              ₱{lifetimeTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="kk-rule mt-8" />

      {/* Search + filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search order ID or product"
            className="h-11 w-full border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-foreground"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => {
            const isActive = statusFilter === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => handleStatusChange(s)}
                className={`label-mono border px-3.5 py-2 transition-colors ${
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {s === "all" ? "All" : STATUS_META[s].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <p className="label-mono mt-5 text-muted-foreground">
        {filteredOrders.length} result{filteredOrders.length !== 1 ? "s" : ""}
      </p>

      {/* Order list */}
      {paginatedOrders.length > 0 ? (
        <div className="mt-4 grid gap-5 sm:gap-6 lg:grid-cols-2">
          {paginatedOrders.map((order) => {
            const status = STATUS_META[order.status];
            const total = getOrderTotal(order.items);

            return (
              <div
                key={order.id}
                className="flex flex-col border border-border bg-card transition-shadow hover:shadow-sm"
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-3 px-5 pt-5">
                  <div>
                    <p className="label-mono text-muted-foreground">
                      {order.id}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${status.dot}`}
                        aria-hidden
                      />
                      <span
                        className={`label-mono font-semibold ${status.text}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <div className="label-mono flex items-center gap-1.5 border border-border px-2.5 py-1.5 text-muted-foreground">
                    {order.paymentMethod === "E-Wallet" ? (
                      <Wallet size={13} />
                    ) : (
                      <Banknote size={13} />
                    )}
                    {order.paymentMethod}
                  </div>
                </div>

                {/* Items */}
                <div className="mt-4 flex-1 px-5">
                  <div className="divide-y divide-border border-y border-border">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center border border-border bg-[var(--color-neutral-warm)]">
                            <Package
                              size={14}
                              className="text-muted-foreground"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-tight">
                              {item.name}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              ₱{item.price.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="shrink-0 text-sm font-bold">
                          ₱{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between px-5 pb-5">
                  <span className="label-mono text-muted-foreground">
                    {getItemCount(order.items)} item
                    {getItemCount(order.items) > 1 ? "s" : ""} · Total
                  </span>
                  <span className="text-lg font-extrabold">
                    ₱{total.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-3 border border-dashed border-border py-16 text-center">
          <Inbox size={28} className="text-muted-foreground" />
          <p className="font-medium">No orders match your search.</p>
          <p className="text-sm text-muted-foreground">
            Try a different keyword or clear the status filter.
          </p>
        </div>
      )}

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <p className="label-mono text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="grid h-10 w-10 place-items-center border border-border bg-background transition-colors hover:bg-[var(--color-neutral-warm)] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="grid h-10 w-10 place-items-center border border-border bg-background transition-colors hover:bg-[var(--color-neutral-warm)] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
