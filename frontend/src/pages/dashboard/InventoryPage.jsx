import { useState } from "react";
import { Archive, Eye, Pencil, Plus, Star, Tag } from "lucide-react";
import { Button } from "@/components/ui";
import { DataTable, PageSection, RowActions, StatusPill } from "@/components/dashboard";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { useDeleteProduct, useProducts } from "@/hooks/useProducts";
import {
  PRODUCT_STATUS_OPTIONS,
} from "@/schemas/product.schema";
import {
  ProductModal,
  PriceModal,
  ArchiveConfirmModal,
} from "@/components/modals";

const capitalize = (value) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export function InventoryPage() {
  const { role } = useAuth();
  const isDTI = role === ROLES.DTI;
  const isKaluppa = role === ROLES.KALUPPA;

  const { data: products = [], isLoading } = useProducts({ all: true });
  const deleteProduct = useDeleteProduct();

  const [modal, setModal] = useState(null);
  const [priceModal, setPriceModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const columns = [
    {
      key: "farm",
      label: "Farm",
      render: (row) => (
        <div>
          <div className="font-semibold text-foreground">
            {row.farm?.propertyNumber ?? "—"}
          </div>
          <div className="label-mono text-muted-foreground">
            {row.owner?.fullName ?? "—"}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (row) => (
        <span className="text-foreground">
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
    ...(isKaluppa
      ? [
          {
            key: "stock",
            label: "Stock",
            render: (row) =>
              row.stock != null ? (
                <span className="text-foreground">
                  {row.stock.toLocaleString()}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              ),
          },
        ]
      : [
          {
            key: "weight",
            label: "Weight (kg)",
            render: (row) =>
              row.weight != null ? (
                <span className="text-foreground">
                  {row.weight.toLocaleString()}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              ),
          },
        ]),
    {
      key: "rating",
      label: "Rating",
      render: (row) => <RatingStars value={row.rating ?? 0} count={row.ratingCount ?? 0} />,
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
            ...(isDTI
              ? [
                  {
                    key: "price",
                    label: "Edit Price",
                    icon: Tag,
                    onClick: () => setPriceModal(row),
                  },
                ]
              : [
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
                ]),
          ]}
        />
      ),
    },
  ];

  const filters = [
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
          !isDTI ? (
            <Button onClick={() => setModal({ mode: "add", data: null })} className="gap-2">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          ) : null
        }
      />

      <DataTable
        rows={products}
        columns={columns}
        searchKeys={[
          (row, query) =>
            (row.farm?.propertyNumber ?? "").toLowerCase().includes(query) ||
            (row.farm?.address ?? "").toLowerCase().includes(query) ||
            (row.owner?.fullName ?? "").toLowerCase().includes(query) ||
            (row.category ?? "").toLowerCase().includes(query) ||
            (row.variety ?? "").toLowerCase().includes(query),
        ]}
        searchPlaceholder="Search by farm, owner, category, or variety…"
        filters={filters}
        getRowKey={(row) => row._id}
        loading={isLoading}
        emptyTitle="No products found"
        emptyDescription="Try adjusting your search or add a new product."
        minWidth="920px"
      />

      {modal && (
        <ProductModal
          mode={modal.mode}
          initial={modal.data}
          onClose={() => setModal(null)}
        />
      )}

      {priceModal && isDTI && (
        <PriceModal
          product={priceModal}
          onClose={() => setPriceModal(null)}
          onSave={() => setPriceModal(null)}
        />
      )}

      {confirmDelete && !isDTI && (
        <ArchiveConfirmModal
          title="Archive product?"
          description={
            <>
              You're about to archive{" "}
              <strong className="text-foreground">
                {confirmDelete.farm?.propertyNumber ?? "this product"}
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
