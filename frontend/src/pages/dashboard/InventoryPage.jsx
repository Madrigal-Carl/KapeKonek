import { useState } from "react";
import { Archive, Eye, Pencil, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui";
import { fmtPrice } from "@/utils/format";
import {
  DataTable,
  PageSection,
  RowActions,
  StatusPill,
} from "@/components/dashboard";
import { useDeleteProduct, useProducts } from "@/hooks/useProducts";
import {
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
} from "@/schemas/product.schema";
import {
  ArchiveConfirmModal,
  ProductModal,
} from "@/components/modals";

const capitalize = (value) =>
  value
    ? value
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "";

export function InventoryPage() {
  const { data: products = [], isLoading } = useProducts({ all: true });
  const deleteProduct = useDeleteProduct();

  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const columns = [
    {
      key: "category",
      label: "Category",
      render: (row) => (
        <span className="font-semibold text-foreground">
          {capitalize(row.category ?? "")}
        </span>
      ),
    },
    {
      key: "variety",
      label: "Variety",
      render: (row) => (
        <span className="text-foreground">
          {row.variety ? capitalize(row.variety) : "—"}
        </span>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (row) =>
        row.stock != null ? (
          <span className="text-foreground">
            {row.stock.toLocaleString()} left
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "price",
      label: "Price",
      render: (row) =>
        row.price != null ? (
          <span className="font-semibold text-foreground">
            {fmtPrice(row.price)}
          </span>
        ) : (
          <span className="text-muted-foreground">Not set</span>
        ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (row) => (
        <RatingStars
          value={row.rating ?? 0}
          count={row.ratingCount ?? 0}
        />
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
      render: (row) => (
        <RowActions
          actions={[
            {
              key: "view",
              label: "View",
              icon: Eye,
              onClick: () => setModal({ mode: "view", data: { ...row } }),
            },
            {
              key: "edit",
              label: "Edit",
              icon: Pencil,
              onClick: () => setModal({ mode: "edit", data: { ...row } }),
            },
            {
              key: "archive",
              label: "Archive",
              icon: Archive,
              danger: true,
              onClick: () => setConfirmDelete(row),
            },
          ]}
        />
      ),
    },
  ];

  const filters = [
    {
      key: "category",
      initialValue: "all",
      options: [
        { value: "all", label: "All Categories" },
        ...PRODUCT_CATEGORY_OPTIONS,
      ],
      matcher: (row, value) => row.category === value,
    },
    {
      key: "status",
      initialValue: "all",
      options: [
        { value: "all", label: "All Status" },
        ...PRODUCT_STATUS_OPTIONS,
      ],
      matcher: (row, value) => row.status === value,
    },
  ];

  return (
    <div className="py-8">
      <PageSection
        eyebrow="Marketplace"
        title="Inventory"
        description="Products, stock levels, ratings, and pricing."
        action={
          <Button
            onClick={() => setModal({ mode: "add", data: null })}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        }
      />

      <DataTable
        rows={products}
        columns={columns}
        searchKeys={[
          (row, query) =>
            (row.category ?? "").toLowerCase().includes(query) ||
            (row.variety ?? "").toLowerCase().includes(query) ||
            (row.description ?? "").toLowerCase().includes(query),
        ]}
        searchPlaceholder="Search by category, variety, or description…"
        filters={filters}
        getRowKey={(row) => row._id}
        loading={isLoading}
        emptyTitle="No products found"
        emptyDescription="Try adjusting your search or add a new product."
        minWidth="860px"
      />

      {modal && (
        <ProductModal
          mode={modal.mode}
          initial={modal.data}
          onClose={() => setModal(null)}
        />
      )}

      {confirmDelete && (
        <ArchiveConfirmModal
          title="Archive product?"
          description={
            <>
              You're about to archive{" "}
              <strong className="text-foreground">
                {capitalize(confirmDelete.category)} ({capitalize(confirmDelete.variety)})
              </strong>
              . It will no longer appear in active lists.
            </>
          }
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            deleteProduct.mutate(confirmDelete._id, {
              onSuccess: () => setConfirmDelete(null),
            });
          }}
        />
      )}
    </div>
  );
}

function RatingStars({ value, count }) {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={
              i < rounded
                ? "h-4 w-4 fill-accent text-accent"
                : "h-4 w-4 text-muted-foreground/40"
            }
          />
        ))}
      </div>
      {value > 0 ? (
        <span className="label-mono ml-1 text-muted-foreground">
          {value.toFixed(1)}
          {count > 0 && <span className="ml-0.5">({count})</span>}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      )}
    </div>
  );
}
