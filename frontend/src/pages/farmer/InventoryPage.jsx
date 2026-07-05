import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Star,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { IconButton, Field, TextInput, Button } from "@/components/ui";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";

const CATEGORIES = [
  "Coffee Seedlings",
  "Coffee Cherries",
  "Fertilizer",
  "Coffee Beans",
];

const VARIETY_OPTIONS = ["Arabica", "Robusta", "Liberica", "Excelsa"];

const FARMER_OPTIONS = [
  "FR-001 \xB7 Lina Okoro",
  "FR-002 \xB7 Samuel Mwangi",
  "FR-003 \xB7 Aisha Bello",
  "FR-004 \xB7 Chidi Okafor",
  "FR-005 \xB7 Joseph Kamau",
  "FR-006 \xB7 Mariam Diallo",
];

const SEED = [
  {
    id: "PD-001",
    name: "Arabica Green Beans",
    category: "Coffee Beans",
    variety: "Arabica",
    stock: 120,
    weightKg: 60,
    price: 350,
    description: "Washed Arabica green beans from Marinduque highlands.",
    images: [],
    status: "active",
    farmer: "FR-001 \xB7 Lina Okoro",
  },
  {
    id: "PD-002",
    name: "Robusta Roasted Medium",
    category: "Coffee Beans",
    variety: "Robusta",
    stock: 45,
    weightKg: 22.5,
    price: 220,
    description: "Medium roast Robusta with chocolatey notes.",
    images: [],
    status: "active",
    farmer: "FR-002 \xB7 Samuel Mwangi",
  },
  {
    id: "PD-003",
    name: "Liberica Ground",
    category: "Coffee Beans",
    variety: "Liberica",
    stock: 0,
    weightKg: 0,
    price: 260,
    description: "Bold ground Liberica, woody and smoky.",
    images: [],
    status: "inactive",
    farmer: "FR-004 \xB7 Chidi Okafor",
  },
  {
    id: "PD-004",
    name: "Coffee Seedlings (Excelsa)",
    category: "Coffee Seedlings",
    variety: "Excelsa",
    stock: 320,
    weightKg: 96,
    price: 45,
    description: "Healthy Excelsa seedlings, 6 months old.",
    images: [],
    status: "active",
    farmer: "FR-005 \xB7 Joseph Kamau",
  },
];

function StatusPill({ status }) {
  const isActive = status === "active";
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 border-l-2 px-2.5 py-1 text-xs font-semibold",
        isActive
          ? "border-accent bg-accent/10 text-foreground"
          : "border-border bg-muted text-foreground",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5",
          isActive ? "bg-accent" : "bg-muted-foreground",
        ]
          .filter(Boolean)
          .join(" ")}
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function fmtPrice(price) {
  if (price === null || price === undefined) return "—";
  return `\u20B1${Number(price).toLocaleString()}`;
}

export function InventoryPage() {
  const { role } = useAuth();
  const isFarmer = role === ROLES.FARMER;
  const isDTI = role === ROLES.DTI;

  const [rows, setRows] = useState(SEED);
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
        category: CATEGORIES[0],
        variety: VARIETY_OPTIONS[0],
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

  return (
    <div className="py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div className="min-w-0">
          <p className="label-mono mb-2 text-accent">Marketplace</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Inventory
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Products, stock levels, weights, and pricing.
          </p>
        </div>
        {!isDTI && (
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        )}
      </div>

      <DataTable
        rows={rows}
        isDTI={isDTI}
        onEdit={(r) => setModal({ mode: "edit", data: { ...r } })}
        onEditPrice={(r) => setPriceModal(r)}
        onDelete={(r) => setConfirmDelete(r)}
      />

      {modal && !isDTI && (
        <ProductModal
          mode={modal.mode}
          initial={modal.data}
          isFarmer={isFarmer}
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
        <DeleteConfirm
          id={confirmDelete.id}
          name={confirmDelete.name}
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

function DataTable({ rows, isDTI = false, onEdit, onEditPrice, onDelete }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filtered = useMemo(() => {
    let r = rows;
    if (query) {
      const q = query.toLowerCase();
      r = r.filter(
        (x) =>
          x.name.toLowerCase().includes(q) ||
          x.id.toLowerCase().includes(q) ||
          x.category.toLowerCase().includes(q) ||
          (x.variety ?? "").toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") r = r.filter((x) => x.status === statusFilter);
    if (categoryFilter !== "all")
      r = r.filter((x) => x.category === categoryFilter);
    return r;
  }, [rows, query, statusFilter, categoryFilter]);

  useEffect(() => setPage(1), [query, statusFilter, categoryFilter]);

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
            placeholder="Search by name, ID, category, or variety…"
            className="w-full border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground"
          />
        </div>
        <div className="relative w-full min-w-[160px] sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full appearance-none border border-border bg-background py-2.5 pl-3 pr-9 text-sm text-foreground outline-none focus:border-foreground"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <div className="relative w-full min-w-[160px] sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full appearance-none border border-border bg-background py-2.5 pl-3 pr-9 text-sm text-foreground outline-none focus:border-foreground"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="relative w-full overflow-auto">
        <table className="w-full min-w-[920px] caption-bottom border-collapse text-sm">
          <thead className="bg-muted/60">
            <tr>
              {[
                "Product Name",
                "Category",
                "Variety",
                "Stock",
                "Weight (kg)",
                "Price",
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
                <td colSpan={8} className="px-4 py-16 text-center">
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center border border-border bg-muted">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="font-semibold text-foreground">
                    No products found
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search or add a new product.
                  </div>
                </td>
              </tr>
            ) : (
              paged.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-border transition-colors hover:bg-muted/40"
                >
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-foreground">
                      {r.name}
                    </div>
                    <div className="label-mono text-muted-foreground">
                      {r.id}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-foreground">{r.category}</td>
                  <td className="px-4 py-3.5 text-foreground">
                    {r.variety || "—"}
                  </td>
                  <td className="px-4 py-3.5 text-foreground">
                    {r.stock.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-foreground">
                    {r.weightKg} kg
                  </td>
                  <td className="px-4 py-3.5 text-foreground">
                    {fmtPrice(r.price)}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {isDTI ? (
                        <IconButton
                          icon={Tag}
                          label="Edit Price"
                          onClick={() => onEditPrice(r)}
                        />
                      ) : (
                        <>
                          <IconButton
                            icon={Pencil}
                            label="Edit"
                            onClick={() => onEdit(r)}
                          />
                          <IconButton
                            icon={Trash2}
                            label="Delete"
                            tone="danger"
                            onClick={() => onDelete(r)}
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
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

function ProductModal({ mode, initial, isFarmer, onClose, onSave }) {
  const [form, setForm] = useState(initial);
  const [uploads, setUploads] = useState([]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const addImages = (files) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const url = URL.createObjectURL(file);
      setUploads((u) => [...u, { id, name: file.name, progress: 0 }]);
      let progress = 0;
      const tick = () => {
        progress += Math.random() * 18 + 8;
        if (progress >= 100) {
          progress = 100;
          setUploads((u) =>
            u.map((x) => (x.id === id ? { ...x, progress: 100, url } : x)),
          );
          setForm((f) => ({
            ...f,
            images: [...f.images, url],
            primaryImage:
              f.primaryImage ?? (f.images.length === 0 ? url : f.primaryImage),
          }));
          setTimeout(
            () => setUploads((u) => u.filter((x) => x.id !== id)),
            600,
          );
          return;
        }
        setUploads((u) => u.map((x) => (x.id === id ? { ...x, progress } : x)));
        setTimeout(tick, 180 + Math.random() * 160);
      };
      setTimeout(tick, 200);
    });
  };

  const removeImage = (url) =>
    setForm((f) => ({
      ...f,
      images: f.images.filter((u) => u !== url),
      primaryImage:
        f.primaryImage === url
          ? f.images.filter((u) => u !== url)[0]
          : f.primaryImage,
    }));

  const setPrimary = (url) => set("primaryImage", url);

  const submit = (e) => {
    e?.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  };

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
            <p className="label-mono mb-1 text-accent">Product</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {mode === "add" ? "Add New Product" : `Edit ${initial.name}`}
            </h2>
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Product Name" full>
              <TextInput
                value={form.name}
                onChange={(v) => set("name", v)}
                placeholder="e.g. Arabica Green Beans"
              />
            </Field>
            <Field label="Category">
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="w-full appearance-none border border-border bg-background px-3 py-2.5 pr-9 text-sm text-foreground outline-none focus:border-foreground"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </Field>
            <Field label="Variety">
              <div className="relative">
                <select
                  value={form.variety}
                  onChange={(e) => set("variety", e.target.value)}
                  className="w-full appearance-none border border-border bg-background px-3 py-2.5 pr-9 text-sm text-foreground outline-none focus:border-foreground"
                >
                  {VARIETY_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </Field>
            <Field label="Status">
              <div className="relative">
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  className="w-full appearance-none border border-border bg-background px-3 py-2.5 pr-9 text-sm text-foreground outline-none focus:border-foreground"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </Field>
            <Field label="Stock">
              <TextInput
                type="number"
                value={String(form.stock)}
                onChange={(v) => set("stock", Number(v))}
                placeholder="0"
              />
            </Field>
            <Field label="Weight (kg)">
              <TextInput
                type="number"
                value={String(form.weightKg)}
                onChange={(v) => set("weightKg", Number(v))}
                placeholder="0"
              />
            </Field>
            <Field label="Price (\u20B1)" full>
              <TextInput
                type="number"
                value={String(form.price ?? 0)}
                onChange={(v) => set("price", Number(v))}
                placeholder="0"
              />
            </Field>

            {!isFarmer && (
              <Field label="Farmer" full>
                <SearchSelect
                  value={form.farmer}
                  onChange={(v) => set("farmer", v)}
                  options={FARMER_OPTIONS}
                  placeholder="Select a farmer…"
                  searchPlaceholder="Search farmers…"
                />
              </Field>
            )}

            <Field label="Description" full>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Short product description…"
                rows={4}
                className="w-full resize-none border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground"
              />
            </Field>
            <Field label="Images" full>
              <label
                htmlFor="product-images-upload"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors hover:border-foreground-40 hover:bg-muted/50"
              >
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
                <div className="text-sm font-medium text-foreground">
                  Click to upload images
                </div>
                <div className="text-xs text-muted-foreground">
                  PNG, JPG up to 5MB each
                </div>
              </label>
              <input
                id="product-images-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  addImages(e.target.files);
                  e.currentTarget.value = "";
                }}
              />
              {uploads.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploads.map((u) => (
                    <div
                      key={u.id}
                      className="border border-border bg-muted/30 px-3 py-2"
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                        <span className="truncate font-medium text-foreground">
                          {u.name}
                        </span>
                        <span className="label-mono text-muted-foreground">
                          {Math.round(u.progress)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden bg-border">
                        <div
                          className={[
                            "h-full transition-all",
                            u.progress >= 100 ? "bg-accent" : "bg-accent/60",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          style={{ width: `${u.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {form.images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {form.images.map((src) => {
                    const isPrimary = form.primaryImage === src;
                    return (
                      <div
                        key={src}
                        className={[
                          "group relative aspect-square overflow-hidden border",
                          isPrimary
                            ? "border-accent ring-2 ring-accent/40"
                            : "border-border",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <img
                          src={src}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        {isPrimary && (
                          <span className="absolute left-1 top-1 inline-flex items-center gap-1 bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
                            <Star className="h-3 w-3 fill-current" /> Primary
                          </span>
                        )}
                        <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => setPrimary(src)}
                              className="grid h-6 w-6 place-items-center bg-background/90 text-foreground hover:bg-accent hover:text-accent-foreground"
                              aria-label="Set as primary"
                              title="Set as primary"
                            >
                              <Star className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(src)}
                            className="grid h-6 w-6 place-items-center bg-background/90 text-foreground hover:bg-destructive hover:text-destructive-foreground"
                            aria-label="Remove image"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Field>
          </div>
        </form>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => submit()}>
            {mode === "add" ? "Add Product" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PriceModal({ product, onClose, onSave }) {
  const [price, setPrice] = useState(product.price ?? 0);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e) => {
    e?.preventDefault();
    onSave(Number(price) || 0);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="label-mono mb-1 text-accent">Product</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Set Price
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.name} <span className="label-mono">({product.id})</span>
            </p>
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <form onSubmit={submit} className="px-6 py-5">
          <Field label="Price (\u20B1)" full>
            <TextInput
              type="number"
              value={String(price)}
              onChange={(v) => setPrice(v)}
              placeholder="0"
            />
          </Field>
        </form>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => submit()}>
            Save Price
          </Button>
        </div>
      </div>
    </div>
  );
}

function SearchSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, []);

  const filtered = useMemo(
    () => options.filter((o) => o.toLowerCase().includes(q.toLowerCase())),
    [q, options],
  );

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 border border-border bg-background px-3 py-2.5 text-left text-sm hover:border-foreground/30"
      >
        <span
          className={["truncate", !value && "text-muted-foreground"]
            .filter(Boolean)
            .join(" ")}
        >
          {value || placeholder}
        </span>
        <ChevronDown
          className={[
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 border border-border bg-card shadow-lg">
          <div className="relative border-b border-border">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-card py-2.5 pl-9 pr-3 text-sm outline-none"
            />
          </div>
          <ul className="max-h-56 overflow-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-muted-foreground">
                No results found.
              </li>
            ) : (
              filtered.map((o) => (
                <li key={o}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o);
                      setOpen(false);
                      setQ("");
                    }}
                    className={[
                      "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted",
                      value === o && "bg-accent/10 font-semibold",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {o}
                    {value === o && <span className="h-1.5 w-1.5 bg-accent" />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function DeleteConfirm({ id, name, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border px-6 py-4">
          <p className="label-mono mb-1 text-destructive">Delete</p>
          <h2 className="text-lg font-semibold text-foreground">
            Remove product?
          </h2>
        </div>
        <div className="px-6 py-5 text-sm text-muted-foreground">
          You're about to delete{" "}
          <span className="font-semibold text-foreground">{name}</span>{" "}
          <span className="label-mono">({id})</span>. This action cannot be
          undone.
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
