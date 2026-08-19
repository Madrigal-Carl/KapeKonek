import { useEffect, useState } from "react";
import { Bookmark, Check, Eye, X } from "lucide-react";
import { DataTable, PageSection, RowActions, StatusPill } from "@/components/dashboard";
import { fmtPrice } from "@/utils/format";
import { useAuth } from "@/hooks/useAuth";
import {
  useCancelOrder,
  useCompleteOrder,
  useOrders,
  useReserveOrder,
} from "@/hooks/useOrders";
import {
  CancelOrderModal,
  OrderDetailsModal,
  UpdateStatusModal,
} from "@/components/modals";

const CANCELLATION_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export function OrdersPage() {
  const { user } = useAuth();
  const isKaluppa = user?.role === "kaluppa";

  const { data: orders = [], isLoading } = useOrders({ all: true });
  const reserveOrder = useReserveOrder();
  const completeOrder = useCompleteOrder();
  const cancelOrder = useCancelOrder();

  const [viewModal, setViewModal] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);

  // Auto-refresh timer to keep 1-hour cancellation calculation accurate
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const canFarmerCancel = (order) =>
    order.status === "pending" &&
    order.createdAt &&
    now - new Date(order.createdAt).getTime() <= CANCELLATION_WINDOW_MS;

  const columns = [
    {
      key: "referenceNumber",
      label: "Reference #",
      render: (row) => (
        <div>
          <div className="font-semibold text-foreground">
            {row.referenceNumber}
          </div>
          {isKaluppa && row.customer && (
            <div className="label-mono text-xs text-muted-foreground">
              {row.customer.fullName || row.customer.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (row) => (
        <span className="text-muted-foreground">
          {row.createdAt
            ? new Date(row.createdAt).toLocaleDateString("en-PH", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "items",
      label: "Items",
      render: (row) => {
        const count = (row.orderedProducts ?? []).reduce(
          (sum, item) => sum + (item.quantity || 1),
          0,
        );
        return (
          <span className="text-foreground">
            {count} item{count !== 1 ? "s" : ""}
          </span>
        );
      },
    },
    {
      key: "paymentMethod",
      label: "Payment",
      render: (row) => <StatusPill status={row.paymentMethod} />,
    },
    {
      key: "deliveryMethod",
      label: "Fulfillment",
      render: (row) => <StatusPill status={row.deliveryMethod} />,
    },
    {
      key: "totalPrice",
      label: "Total Price",
      render: (row) => {
        const isDelivery = row.deliveryMethod === "delivery";
        const fee = isDelivery && row.deliveryFee != null ? row.deliveryFee : 0;
        const finalAmount = (row.totalPrice || 0) + fee;

        return (
          <div>
            <div className="font-semibold text-foreground">
              {fmtPrice(finalAmount)}
            </div>
            {isDelivery && row.deliveryFee != null && (
              <div className="label-mono text-[11px] text-muted-foreground">
                incl. {fmtPrice(row.deliveryFee)} fee
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusPill status={row.status} />,
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (row) => {
        if (isKaluppa) {
          const actions = [
            {
              key: "view",
              label: "View",
              icon: Eye,
              onClick: () => setViewModal(row),
            },
          ];

          if (row.status === "pending") {
            actions.push({
              key: "reserve",
              label: "Mark as Reserved",
              icon: Bookmark,
              onClick: () => setStatusModal(row),
            });
            actions.push({
              key: "cancel",
              label: "Cancel order",
              icon: X,
              danger: true,
              onClick: () => setCancelModal(row),
            });
          } else if (row.status === "reserved") {
            actions.push({
              key: "complete",
              label: "Mark as Completed",
              icon: Check,
              onClick: () => setStatusModal(row),
            });
          }

          return <RowActions actions={actions} />;
        }

        // Farmer Role (Customer)
        const farmerActions = [
          {
            key: "view",
            label: "View",
            icon: Eye,
            onClick: () => setViewModal(row),
          },
        ];

        if (canFarmerCancel(row)) {
          farmerActions.push({
            key: "cancel",
            label: "Cancel order",
            icon: X,
            danger: true,
            onClick: () => setCancelModal(row),
          });
        }

        return <RowActions actions={farmerActions} />;
      },
    },
  ];

  const filters = [
    {
      key: "status",
      initialValue: "all",
      options: [
        { value: "all", label: "All Status" },
        { value: "pending", label: "Pending" },
        { value: "reserved", label: "Reserved" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ],
      matcher: (row, value) => row.status === value,
    },
    {
      key: "deliveryMethod",
      initialValue: "all",
      options: [
        { value: "all", label: "All Fulfillment" },
        { value: "delivery", label: "Delivery" },
        { value: "pickup", label: "Pickup" },
      ],
      matcher: (row, value) => row.deliveryMethod === value,
    },
  ];

  return (
    <div className="py-8">
      <PageSection
        eyebrow={isKaluppa ? "Marketplace" : "Purchases"}
        title={isKaluppa ? "Orders Management" : "My Orders"}
        description={
          isKaluppa
            ? "Review incoming customer orders, mark them as reserved or completed, and handle pending cancellations."
            : "Track your placed orders, review items, and manage pending cancellations within 1 hour."
        }
      />

      <DataTable
        rows={orders}
        columns={columns}
        searchKeys={[
          (row, query) =>
            (row.referenceNumber ?? "").toLowerCase().includes(query) ||
            (row.customer?.fullName ?? "").toLowerCase().includes(query) ||
            (row.customer?.email ?? "").toLowerCase().includes(query) ||
            (row.paymentMethod ?? "").toLowerCase().includes(query) ||
            (row.deliveryMethod ?? "").toLowerCase().includes(query) ||
            (row.orderedProducts ?? []).some((p) =>
              (p.name ?? "").toLowerCase().includes(query),
            ),
        ]}
        searchPlaceholder="Search by reference, customer, or product…"
        filters={filters}
        getRowKey={(row) => row._id}
        loading={isLoading}
        emptyTitle="No orders found"
        emptyDescription="Try adjusting your search or filters."
        minWidth="920px"
      />

      {viewModal && (
        <OrderDetailsModal
          order={viewModal}
          onClose={() => setViewModal(null)}
        />
      )}

      {statusModal && (
        <UpdateStatusModal
          order={statusModal}
          onClose={() => setStatusModal(null)}
          isPending={reserveOrder.isPending || completeOrder.isPending}
          onReserve={(id, payload) => {
            reserveOrder.mutate(
              { id, data: payload },
              { onSuccess: () => setStatusModal(null) },
            );
          }}
          onComplete={(id) => {
            completeOrder.mutate(id, {
              onSuccess: () => setStatusModal(null),
            });
          }}
        />
      )}

      {cancelModal && (
        <CancelOrderModal
          order={cancelModal}
          isKaluppa={isKaluppa}
          isPending={cancelOrder.isPending}
          onClose={() => setCancelModal(null)}
          onConfirm={(payload) => {
            cancelOrder.mutate(
              { id: cancelModal._id, data: payload },
              { onSuccess: () => setCancelModal(null) },
            );
          }}
        />
      )}
    </div>
  );
}
