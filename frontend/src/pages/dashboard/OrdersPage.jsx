import { useState } from "react";
import { Check, Eye, X } from "lucide-react";
import { DataTable, PageSection, RowActions, StatusPill } from "@/components/dashboard";
import { fmtPrice } from "@/utils/format";
import { ORDERS } from "@/constants/data";
import {
  OrderDetailsModal,
  UpdateStatusModal,
  CancelOrderModal,
} from "@/components/modals";

export function OrdersPage() {
  const [rows, setRows] = useState(ORDERS);
  const [view, setView] = useState(null);
  const [completeDialog, setCompleteDialog] = useState(null);
  const [cancelDialog, setCancelDialog] = useState(null);

  const updateStatus = (ref, patch) => {
    setRows((r) => r.map((x) => (x.ref === ref ? { ...x, ...patch } : x)));
  };

  const columns = [
    {
      key: "ref",
      label: "Reference #",
      render: (row) => (
        <div>
          <div className="font-semibold text-foreground">{row.ref}</div>
          <div className="label-mono text-muted-foreground">{row.customer}</div>
        </div>
      ),
    },
    {
      key: "method",
      label: "Payment Method",
      render: (row) => <StatusPill status={row.method} />,
    },
    {
      key: "deliveryMethod",
      label: "Delivery Method",
      render: (row) => <StatusPill status={row.deliveryMethod} />,
    },
    {
      key: "total",
      label: "Total Price",
      render: (row) => (
        <span className="font-semibold text-foreground">
          {fmtPrice(row.total)}
        </span>
      ),
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
        const isFinal =
          row.status === "completed" || row.status === "cancelled";
        return (
          <RowActions
            actions={[
              {
                key: "view",
                label: "View",
                icon: Eye,
                onClick: () => setView(row),
              },
              {
                key: "complete",
                label:
                  row.status === "reserved"
                    ? "Mark as completed"
                    : "Mark as completed or reserved",
                icon: Check,
                disabled: isFinal,
                onClick: () => setCompleteDialog({ order: row }),
              },
              {
                key: "cancel",
                label: "Cancel order",
                icon: X,
                danger: true,
                disabled: isFinal,
                onClick: () => setCancelDialog({ order: row }),
              },
            ]}
          />
        );
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
  ];

  return (
    <div className="py-8">
      <PageSection
        eyebrow="Marketplace"
        title="Orders"
        description="Track incoming orders, mark them as reserved or completed, and handle cancellations."
      />

      <DataTable
        rows={rows}
        columns={columns}
        searchKeys={[
          (row, query) =>
            row.ref.toLowerCase().includes(query) ||
            (row.customer ?? "").toLowerCase().includes(query) ||
            row.method.toLowerCase().includes(query),
        ]}
        searchPlaceholder="Search by reference, customer, or payment…"
        filters={filters}
        getRowKey={(row) => row.ref}
        emptyTitle="No orders found"
        emptyDescription="Try adjusting your search or filters."
        minWidth="900px"
      />

      {view && <OrderDetailsModal order={view} onClose={() => setView(null)} />}

      {completeDialog && (
        <UpdateStatusModal
          order={completeDialog.order}
          onClose={() => setCompleteDialog(null)}
          onSelect={(next, extra) => {
            updateStatus(completeDialog.order.ref, { status: next, ...extra });
            setCompleteDialog(null);
          }}
        />
      )}

      {cancelDialog && (
        <CancelOrderModal
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
