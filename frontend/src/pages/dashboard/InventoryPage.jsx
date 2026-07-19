import { useState } from "react";
import { Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { IconButton, Button } from "@/components/ui";
import { fmtPrice } from "@/utils/format";
import { DataTable, PageSection, StatusPill } from "@/components/dashboard";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { PRODUCTS, PRODUCT_CATEGORY_OPTIONS } from "@/constants/data";
import {
  ProductModal,
  PriceModal,
  DeleteConfirmModal,
} from "@/components/modals";

export function InventoryPage() {
  const { role } = useAuth();
  const isManager = role === ROLES.MANAGER;
  const isDTI = role === ROLES.DTI;

  const [rows, setRows] = useState(PRODUCTS);
  const [modal, setModal] = useState(null);
  const [priceModal, setPriceModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const nextId = () => `PD-${String(rows.length + 1).padStart(3, "0")}`;

  const openAdd = () =>
    setModal({
      mode: "add",
      data: {
        id: nextId(),
        name: "",
        category: PRODUCT_CATEGORY_OPTIONS[0],
        variety: "Arabica",
        stock: 0,
        weightKg: 0,
        price: 0,
        description: "",
        images: [],
        status: "active",
        farmer: "",
      },
    });

  const handleSave = (data) => {
    setRows((r) => {
      const cleaned = {
        ...data,
        stock: Number(data.stock) || 0,
        weightKg: Number(data.weightKg) || 0,
        price: Number(data.price) || 0,
      };
      const exists = r.find((x) => x.id === data.id);
      if (exists) return r.map((x) => (x.id === data.id ? cleaned : x));
      return [...r, cleaned];
    });
    setModal(null);
  };

  const handleSavePrice = (id, price) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, price } : x)));
    setPriceModal(null);
  };

  const columns = [
    {
      key: "name",
      label: "Product Name",
      render: (row) => (
        <div>
          <div className="font-semibold text-foreground">{row.name}</div>
          <div className="label-mono text-muted-foreground">{row.id}</div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (row) => <span className="text-foreground">{row.category}</span>,
    },
    {
      key: "variety",
      label: "Variety",
      render: (row) => (
        <span className="text-foreground">{row.variety || "—"}</span>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (row) => (
        <span className="text-foreground">{row.stock.toLocaleString()}</span>
      ),
    },
    {
      key: "weightKg",
      label: "Weight (kg)",
      render: (row) => (
        <span className="text-foreground">{row.weightKg} kg</span>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (row) => (
        <span className="text-foreground">{fmtPrice(row.price)}</span>
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
        <div className="flex items-center justify-end gap-1">
          {isDTI ? (
            <IconButton
              icon={Tag}
              label="Edit Price"
              onClick={() => setPriceModal(row)}
            />
          ) : (
            <>
              <IconButton
                icon={Pencil}
                label="Edit"
                onClick={() => setModal({ mode: "edit", data: { ...row } })}
              />
              <IconButton
                icon={Trash2}
                label="Delete"
                tone="danger"
                onClick={() => setConfirmDelete(row)}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  const filters = [
    {
      key: "category",
      initialValue: "all",
      options: [
        { value: "all", label: "All Categories" },
        ...PRODUCT_CATEGORY_OPTIONS.map((value) => ({ value, label: value })),
      ],
      matcher: (row, value) => row.category === value,
    },
    {
      key: "status",
      initialValue: "all",
      options: [
        { value: "all", label: "All Status" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
      matcher: (row, value) => row.status === value,
    },
  ];

  return (
    <div className="py-8">
      <PageSection
        eyebrow="Marketplace"
        title="Inventory"
        description="Products, stock levels, weights, and pricing."
        action={
          !isDTI ? (
            <Button onClick={openAdd} className="gap-2">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          ) : null
        }
      />

      <DataTable
        rows={rows}
        columns={columns}
        searchKeys={[
          (row, query) =>
            row.name.toLowerCase().includes(query) ||
            row.id.toLowerCase().includes(query) ||
            row.category.toLowerCase().includes(query) ||
            (row.variety ?? "").toLowerCase().includes(query),
        ]}
        searchPlaceholder="Search by name, ID, category, or variety…"
        filters={filters}
        pageSize={5}
        emptyTitle="No products found"
        emptyDescription="Try adjusting your search or add a new product."
        minWidth="920px"
      />

      {modal && !isDTI && (
        <ProductModal
          mode={modal.mode}
          initial={modal.data}
          isManager={isManager}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {priceModal && isDTI && (
        <PriceModal
          product={priceModal}
          onClose={() => setPriceModal(null)}
          onSave={(price) => handleSavePrice(priceModal.id, price)}
        />
      )}

      {confirmDelete && !isDTI && (
        <DeleteConfirmModal
          title="Remove product?"
          description={
            <>
              You're about to delete{" "}
              <span className="font-semibold text-foreground">
                {confirmDelete.name}
              </span>{" "}
              <span className="label-mono">({confirmDelete.id})</span>. This
              action cannot be undone.
            </>
          }
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            setRows((r) => r.filter((x) => x.id !== confirmDelete.id));
            setConfirmDelete(null);
          }}
        />
      )}
    </div>
  );
}
