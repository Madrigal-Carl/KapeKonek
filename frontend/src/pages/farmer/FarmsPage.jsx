import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Crosshair,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  IconButton,
  Field,
  TextInput,
  FormatDate,
  Button,
} from "@/components/ui";

const EXISTING_FARM_REGISTRY = [
  {
    id: "RG-101",
    address: "Sitio Bantad, Boac, Marinduque",
    size: 3.4,
    location: { lat: 13.4612, lng: 121.8501 },
  },
  {
    id: "RG-102",
    address: "Barangay Balogo, Mogpog, Marinduque",
    size: 5.1,
    location: { lat: 13.4801, lng: 121.8702 },
  },
  {
    id: "RG-103",
    address: "Sitio Bayuti, Torrijos, Marinduque",
    size: 2.9,
    location: { lat: 13.3215, lng: 122.0843 },
  },
  {
    id: "RG-104",
    address: "Barangay Tapuyan, Buenavista, Marinduque",
    size: 7.2,
    location: { lat: 13.2658, lng: 121.9381 },
  },
  {
    id: "RG-105",
    address: "Sitio Marlangga, Santa Cruz, Marinduque",
    size: 4.6,
    location: { lat: 13.4762, lng: 122.0291 },
  },
];
const BOAC_CENTER = { lat: 13.4477, lng: 121.8407 };
const CROP_OPTIONS = [
  "Arabica",
  "Robusta",
  "Liberica",
  "Excelsa",
  "Maize",
  "Banana",
];
const FARMER_OPTIONS = [
  "FR-001 \xB7 Lina Okoro",
  "FR-002 \xB7 Samuel Mwangi",
  "FR-003 \xB7 Aisha Bello",
  "FR-004 \xB7 Chidi Okafor",
  "FR-005 \xB7 Joseph Kamau",
  "FR-006 \xB7 Mariam Diallo",
];
const CROP_STATUS_LABEL = {
  planted: "Planted",
  growing: "Growing",
  harvested: "Harvested",
  fallow: "Fallow",
};
const CROP_STATUS_TONE = {
  planted: "info",
  growing: "success",
  harvested: "warning",
  fallow: "neutral",
};
const CROP_STATUS_OPTIONS = [
  { value: "planted", label: "Planted" },
  { value: "growing", label: "Growing" },
  { value: "harvested", label: "Harvested" },
  { value: "fallow", label: "Fallow" },
];
const SEED = [
  {
    id: "FM-001",
    address: "Sitio Malusak, Boac, Marinduque",
    size: 4.2,
    farmers: ["FR-001 \xB7 Lina Okoro", "FR-002 \xB7 Samuel Mwangi"],
    crops: [
      { crop: "Arabica", status: "growing" },
      { crop: "Banana", status: "planted" },
    ],
    yieldKg: 1820,
    location: { lat: 13.4521, lng: 121.8389 },
    joinedAt: "2026-01-15",
    history: [
      { action: "Received", item: "Arabica seeds", date: "2026-02-04" },
      { action: "Harvested", item: "Arabica", date: "2026-05-12" },
    ],
  },
  {
    id: "FM-002",
    address: "Barangay Tugos, Mogpog, Marinduque",
    size: 2.6,
    farmers: ["FR-003 \xB7 Aisha Bello"],
    crops: [{ crop: "Robusta", status: "harvested" }],
    yieldKg: 940,
    location: { lat: 13.4731, lng: 121.8612 },
    joinedAt: "2025-11-03",
    history: [{ action: "Harvested", item: "Robusta", date: "2026-06-02" }],
  },
  {
    id: "FM-003",
    address: "Sitio Hinapulan, Gasan, Marinduque",
    size: 6.8,
    farmers: ["FR-004 \xB7 Chidi Okafor", "FR-005 \xB7 Joseph Kamau"],
    crops: [
      { crop: "Liberica", status: "growing" },
      { crop: "Excelsa", status: "planted" },
      { crop: "Maize", status: "fallow" },
    ],
    yieldKg: 3120,
    location: { lat: 13.3221, lng: 121.8693 },
    joinedAt: "2025-08-21",
    history: [
      { action: "Received", item: "Liberica seeds", date: "2026-01-19" },
    ],
  },
];
function StatusPill({ tone = "neutral", children }) {
  const map = {
    success: "border-accent bg-accent/10 text-foreground",
    warning: "border-[#b8860b] bg-[#fff7e6] text-foreground",
    danger: "border-destructive bg-destructive/10 text-foreground",
    neutral: "border-border bg-muted text-foreground",
    info: "border-[#3b82f6] bg-[#e8f1ff] text-foreground",
  };
  const dot = {
    success: "bg-accent",
    warning: "bg-[#b8860b]",
    danger: "bg-destructive",
    neutral: "bg-muted-foreground",
    info: "bg-[#3b82f6]",
  };
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 border-l-2 px-2.5 py-1 text-xs font-semibold",
        map[tone],
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={["h-1.5 w-1.5", dot[tone]].filter(Boolean).join(" ")} />
      {children}
    </span>
  );
}
function fmtCoord(n, pos, neg) {
  const dir = n >= 0 ? pos : neg;
  return `${Math.abs(n).toFixed(4)}\xB0 ${dir}`;
}
export function FarmsPage() {
  const [rows, setRows] = useState(SEED);
  const [modal, setModal] = useState(null);
  const [addChooserOpen, setAddChooserOpen] = useState(false);
  const [existingOpen, setExistingOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const nextId = () => `FM-${String(rows.length + 1).padStart(3, "0")}`;
  const openAddNew = () =>
    setModal({
      mode: "add",
      data: {
        id: nextId(),
        address: "",
        size: 0,
        farmers: [],
        crops: [],
        yieldKg: 0,
        location: null,
        joinedAt: /* @__PURE__ */ new Date().toISOString().slice(0, 10),
      },
    });
  const attachExisting = (registryId) => {
    const reg = EXISTING_FARM_REGISTRY.find((r) => r.id === registryId);
    if (!reg) return;
    const today = /* @__PURE__ */ new Date().toISOString().slice(0, 10);
    setRows((r) => [
      ...r,
      {
        id: nextId(),
        address: reg.address,
        size: reg.size,
        farmers: [],
        crops: [],
        yieldKg: 0,
        location: reg.location,
        joinedAt: today,
        history: [
          { action: "Linked", item: `Existing farm ${reg.id}`, date: today },
        ],
        isExisting: true,
      },
    ]);
    setExistingOpen(false);
  };
  const handleSave = (data) => {
    setRows((r) => {
      const today = /* @__PURE__ */ new Date().toISOString().slice(0, 10);
      const cleaned = {
        ...data,
        size: Number(data.size) || 0,
        yieldKg: Number(data.yieldKg) || 0,
        crops: (data.crops || []).filter((c) => c.crop),
      };
      const exists = r.find((x) => x.id === data.id);
      if (exists) {
        const prevCrops = exists.crops.map((c) => c.crop);
        const nextCrops = cleaned.crops.map((c) => c.crop);
        const added = nextCrops.filter((x) => !prevCrops.includes(x));
        const harvestedNew = cleaned.crops.filter((c) => {
          const before = exists.crops.find((p) => p.crop === c.crop);
          return (
            c.status === "harvested" &&
            (!before || before.status !== "harvested")
          );
        });
        const newEvents = [
          ...added.map((c) => ({
            action: "Received",
            item: `${c} seeds`,
            date: today,
          })),
          ...harvestedNew.map((c) => ({
            action: "Harvested",
            item: c.crop,
            date: today,
          })),
        ];
        return r.map((x) =>
          x.id === data.id
            ? {
                ...x,
                ...cleaned,
                history: [...(x.history || []), ...newEvents],
              }
            : x,
        );
      }
      return [
        ...r,
        {
          ...cleaned,
          history: cleaned.crops.map((c) => ({
            action: c.status === "harvested" ? "Harvested" : "Received",
            item: c.status === "harvested" ? c.crop : `${c.crop} seeds`,
            date: today,
          })),
        },
      ];
    });
    setModal(null);
  };
  return (
    <div className="py-8">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div className="min-w-0">
          <p className="label-mono mb-2 text-accent">Records</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Farms
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Land assets, sizes, geotagged plots, and crop allocations.
          </p>
        </div>
        <Button onClick={() => setAddChooserOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Farm
        </Button>
      </div>

      <DataTable
        rows={rows}
        onEdit={(r) => setModal({ mode: "edit", data: { ...r } })}
        onDelete={(r) => setConfirmDelete(r)}
      />

      {modal && (
        <FarmModal
          mode={modal.mode}
          initial={modal.data}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {addChooserOpen && (
        <AddChooser
          onClose={() => setAddChooserOpen(false)}
          onNew={() => {
            setAddChooserOpen(false);
            openAddNew();
          }}
          onExisting={() => {
            setAddChooserOpen(false);
            setExistingOpen(true);
          }}
        />
      )}

      {existingOpen && (
        <ExistingFarmModal
          options={EXISTING_FARM_REGISTRY.filter(
            (reg) => !rows.some((r) => r.address === reg.address),
          )}
          onClose={() => setExistingOpen(false)}
          onSelect={attachExisting}
        />
      )}

      {confirmDelete && (
        <DeleteConfirm
          id={confirmDelete.id}
          name={confirmDelete.address}
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
function DataTable({ rows, onEdit, onDelete }) {
  const [query, setQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const filtered = useMemo(() => {
    let r = rows;
    if (query) {
      const q = query.toLowerCase();
      r = r.filter(
        (x) =>
          x.address.toLowerCase().includes(q) || x.id.toLowerCase().includes(q),
      );
    }
    if (sizeFilter !== "all") {
      const [min, max] = sizeFilter
        .split("-")
        .map((n) => (n ? parseFloat(n) : Infinity));
      r = r.filter((x) => x.size >= min && x.size < max);
    }
    if (sortKey) {
      const acc = (x) => x[sortKey];
      r = [...r].sort((a, b) => {
        const av = acc(a);
        const bv = acc(b);
        if (av === bv) return 0;
        return (av > bv ? 1 : -1) * (sortDir === "asc" ? 1 : -1);
      });
    }
    return r;
  }, [rows, query, sizeFilter, sortKey, sortDir]);
  useEffect(() => setPage(1), [query, sizeFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const toggleSort = (k) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  };
  const SortIcon = ({ k }) =>
    sortKey === k ? (
      sortDir === "asc" ? (
        <ChevronUp className="h-3 w-3 text-accent" />
      ) : (
        <ChevronDown className="h-3 w-3 text-accent" />
      )
    ) : null;
  return (
    <div className="border border-border bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by address or ID…"
            className="w-full border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground"
          />
        </div>
        <div className="relative min-w-[160px] flex-1">
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="w-full appearance-none border border-border bg-background py-2.5 pl-3 pr-9 text-sm text-foreground outline-none focus:border-foreground"
          >
            <option value="all">All Sizes</option>
            <option value="0-2">0 – 2 ha</option>
            <option value="2-5">2 – 5 ha</option>
            <option value="5-10">5 – 10 ha</option>
            <option value="10-999">10+ ha</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {/* Table */}
      <div className="relative w-full overflow-auto">
        <table className="w-full min-w-[720px] caption-bottom border-collapse text-sm">
          <thead className="bg-muted/60">
            <tr>
              {[
                { k: "address", l: "Address", sortable: true },
                { k: "size", l: "Size (ha)", sortable: true },
                { k: "yieldKg", l: "Yielded Coffee (kg)", sortable: true },
                { k: "joinedAt", l: "Joined At", sortable: true },
                { k: "actions", l: "", sortable: false },
              ].map((c) => (
                <th
                  key={c.k}
                  onClick={() => c.sortable && toggleSort(c.k)}
                  className={[
                    "label-mono px-4 py-3 text-left text-muted-foreground",
                    c.sortable &&
                      "cursor-pointer select-none hover:text-foreground",
                    c.k === "actions" && "text-right",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.l}
                    {c.sortable && <SortIcon k={c.k} />}
                  </span>
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
                    No farms found
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search or add a new farm.
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
                      {r.address}
                    </div>
                    <div className="label-mono text-muted-foreground">
                      {r.id}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-foreground">{r.size} ha</td>
                  <td className="px-4 py-3.5 text-foreground">
                    {r.yieldKg.toLocaleString()} kg
                  </td>
                  <td className="px-4 py-3.5 text-foreground">
                    {FormatDate(r.joinedAt)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {!r.isExisting && (
                        <IconButton
                          icon={Pencil}
                          label="Edit"
                          onClick={() => onEdit(r)}
                        />
                      )}
                      <IconButton
                        icon={Trash2}
                        label="Delete"
                        tone="danger"
                        onClick={() => onDelete(r)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
function FarmModal({ mode, initial, onClose, onSave }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const submit = (e) => {
    e?.preventDefault();
    if (!form.address) return;
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
            <p className="label-mono mb-1 text-accent">Farm</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {mode === "add" ? "Add New Farm" : `Edit ${initial.address}`}
            </h2>
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Size (Hectares)" full>
              <TextInput
                type="number"
                value={String(form.size)}
                onChange={(v) => set("size", Number(v))}
                placeholder="24"
              />
            </Field>
            <Field label="Address" full>
              <TextInput
                value={form.address}
                onChange={(v) => set("address", v)}
                placeholder="Sitio, Barangay, Municipality"
              />
            </Field>
            <Field label="Geotag Location" full>
              <LocationPicker
                value={form.location}
                onChange={(v) => set("location", v)}
              />
            </Field>
          </div>
        </form>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => submit()}>
            {mode === "add" ? "Add Farm" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
function MultiSelect({
  values,
  onChange,
  options,
  placeholder,
  allowCreate = false,
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
  const trimmed = q.trim();
  const canCreate =
    allowCreate &&
    trimmed.length > 0 &&
    !options.some((o) => o.toLowerCase() === trimmed.toLowerCase());
  const toggle = (o) =>
    onChange(
      values.includes(o) ? values.filter((v) => v !== o) : [...values, o],
    );
  const handleCreate = () => {
    if (!canCreate) return;
    if (!values.includes(trimmed)) onChange([...values, trimmed]);
    setQ("");
  };
  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 border border-border bg-background px-3 py-2.5 text-left text-sm hover:border-foreground/30"
      >
        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          {values.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            values.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1 border border-border bg-accent/10 px-2 py-0.5 text-xs font-semibold text-foreground"
              >
                {v}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(values.filter((x) => x !== v));
                  }}
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </span>
              </span>
            ))
          )}
        </div>
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && canCreate) {
                  e.preventDefault();
                  handleCreate();
                }
              }}
              placeholder="Search…"
              className="w-full bg-card py-2.5 pl-9 pr-3 text-sm outline-none"
            />
          </div>
          <ul className="max-h-56 overflow-auto">
            {filtered.length === 0 && !canCreate ? (
              <li className="px-3 py-3 text-sm text-muted-foreground">
                No results.
              </li>
            ) : (
              filtered.map((o) => {
                const selected = values.includes(o);
                return (
                  <li key={o}>
                    <button
                      type="button"
                      onClick={() => toggle(o)}
                      className={[
                        "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted",
                        selected && "bg-accent/10 font-semibold",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {o}
                      {selected && <span className="h-1.5 w-1.5 bg-accent" />}
                    </button>
                  </li>
                );
              })
            )}
            {canCreate && (
              <li className="border-t border-border">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-accent hover:bg-muted"
                >
                  <Plus className="h-4 w-4" />
                  Add "{trimmed}"
                </button>
              </li>
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
        className="w-full max-w-sm border border-border bg-card p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="mb-1 text-lg font-semibold tracking-tight text-foreground">
          Delete Farm?
        </h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <strong className="text-foreground">
            {id} ({name})
          </strong>
          ? This action cannot be undone.
        </p>
        <div className="flex items-center justify-center gap-2">
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
const MARKER_ICON_URL =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const MARKER_ICON_2X_URL =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const MARKER_SHADOW_URL =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
function LeafletMap({
  location,
  onPick,
  interactive = true,
  className = "h-56",
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onPickRef = useRef(onPick);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);
  useEffect(() => {
    let cancelled = false;
    let cleanup = [];
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;
      const icon = L.icon({
        iconUrl: MARKER_ICON_URL,
        iconRetinaUrl: MARKER_ICON_2X_URL,
        shadowUrl: MARKER_SHADOW_URL,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      const start = location || BOAC_CENTER;
      const zoom = location ? 15 : 12;
      const map = L.map(containerRef.current, {
        center: [start.lat, start.lng],
        zoom,
        scrollWheelZoom: interactive,
        dragging: interactive,
        doubleClickZoom: interactive,
        zoomControl: interactive,
      });
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      if (location) {
        markerRef.current = L.marker([location.lat, location.lng], {
          icon,
          draggable: interactive,
        }).addTo(map);
        if (interactive) {
          markerRef.current.on("dragend", (e) => {
            const { lat, lng } = e.target.getLatLng();
            onPickRef.current?.({
              lat: Number(lat.toFixed(6)),
              lng: Number(lng.toFixed(6)),
            });
          });
        }
      }
      if (interactive) {
        map.on("click", (e) => {
          const lat = Number(e.latlng.lat.toFixed(6));
          const lng = Number(e.latlng.lng.toFixed(6));
          if (!markerRef.current) {
            markerRef.current = L.marker([lat, lng], {
              icon,
              draggable: true,
            }).addTo(map);
            markerRef.current.on("dragend", (ev) => {
              const ll = ev.target.getLatLng();
              onPickRef.current?.({
                lat: Number(ll.lat.toFixed(6)),
                lng: Number(ll.lng.toFixed(6)),
              });
            });
          } else {
            markerRef.current.setLatLng([lat, lng]);
          }
          onPickRef.current?.({ lat, lng });
        });
      }
      const ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(containerRef.current);
      cleanup.push(() => ro.disconnect());
      setTimeout(() => map.invalidateSize(), 50);
      setReady(true);
    })();
    return () => {
      cancelled = true;
      cleanup.forEach((fn) => fn());
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
    };
  }, []);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    (async () => {
      const L = (await import("leaflet")).default;
      if (!location) {
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
        return;
      }
      const latlng = [location.lat, location.lng];
      if (markerRef.current) {
        markerRef.current.setLatLng(latlng);
      } else {
        const icon = L.icon({
          iconUrl: MARKER_ICON_URL,
          iconRetinaUrl: MARKER_ICON_2X_URL,
          shadowUrl: MARKER_SHADOW_URL,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
        markerRef.current = L.marker(latlng, {
          icon,
          draggable: interactive,
        }).addTo(map);
        if (interactive) {
          markerRef.current.on("dragend", (e) => {
            const ll = e.target.getLatLng();
            onPickRef.current?.({
              lat: Number(ll.lat.toFixed(6)),
              lng: Number(ll.lng.toFixed(6)),
            });
          });
        }
      }
      map.setView(latlng, Math.max(map.getZoom(), 13));
    })();
  }, [location?.lat, location?.lng, ready, interactive]);
  return (
    <div
      ref={containerRef}
      className={[
        "relative z-0 w-full border border-border bg-muted",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
function LocationPicker({ value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setBusy(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        });
        setBusy(false);
      },
      (err) => {
        setError(err.message || "Unable to get current location.");
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 1e4 },
    );
  };
  return (
    <div className="space-y-3 border border-border bg-muted/30 p-3">
      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
        <span>
          Click anywhere on the map to drop a pin. Drag it to refine the
          farm&apos;s exact location.
        </span>
      </div>
      <LeafletMap location={value} onPick={onChange} className="h-64" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          {value ? (
            <span className="font-mono text-foreground">
              {fmtCoord(value.lat, "N", "S")}, {fmtCoord(value.lng, "E", "W")}
            </span>
          ) : (
            <span className="text-muted-foreground">No pin dropped yet.</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={useMyLocation}
            disabled={busy}
            className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-60"
          >
            <Crosshair className="h-3.5 w-3.5 text-accent" />
            {busy ? "Locating\u2026" : "Use my location"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1 border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>
      {error && (
        <div className="flex items-start gap-1.5 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
function AddChooser({ onClose, onNew, onExisting }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="label-mono mb-1 text-accent">Farm</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Add Farm
            </h2>
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>
        <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">
          <button
            type="button"
            onClick={onExisting}
            className="group flex flex-col items-start gap-2 border border-border bg-background p-5 text-left transition-colors hover:border-foreground-40 hover:bg-muted/60"
          >
            <span className="grid h-9 w-9 place-items-center border border-border bg-muted text-accent">
              <Search className="h-4 w-4" />
            </span>
            <span className="font-semibold text-foreground">
              Add Existing Farm
            </span>
            <span className="text-xs text-muted-foreground">
              Pick from the registry of pre-mapped farms in your area.
            </span>
          </button>
          <button
            type="button"
            onClick={onNew}
            className="group flex flex-col items-start gap-2 border border-border bg-background p-5 text-left transition-colors hover:border-foreground-40 hover:bg-muted/60"
          >
            <span className="grid h-9 w-9 place-items-center border border-border bg-muted text-accent">
              <Plus className="h-4 w-4" />
            </span>
            <span className="font-semibold text-foreground">Add New Farm</span>
            <span className="text-xs text-muted-foreground">
              Capture size, address, and geotag a brand-new plot on the map.
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
function ExistingFarmModal({ options, onClose, onSelect }) {
  const [selected, setSelected] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, []);
  const filtered = useMemo(
    () =>
      options.filter(
        (o) =>
          o.address.toLowerCase().includes(q.toLowerCase()) ||
          o.id.toLowerCase().includes(q.toLowerCase()),
      ),
    [q, options],
  );
  const selectedRow = options.find((o) => o.id === selected);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="label-mono mb-1 text-accent">Farm</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Add Existing Farm
            </h2>
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <div className="px-6 py-5">
          <label className="label-mono mb-1.5 block text-muted-foreground">
            Farm
          </label>
          <div ref={ref} className="relative w-full">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-2 border border-border bg-background px-3 py-2.5 text-left text-sm hover:border-foreground/30"
            >
              <span
                className={["truncate", !selectedRow && "text-muted-foreground"]
                  .filter(Boolean)
                  .join(" ")}
              >
                {selectedRow
                  ? `${selectedRow.id} \xB7 ${selectedRow.address}`
                  : "Select a farm\u2026"}
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
                    placeholder="Search by address or ID…"
                    className="w-full bg-card py-2.5 pl-9 pr-3 text-sm outline-none"
                  />
                </div>
                <ul className="max-h-64 overflow-auto">
                  {filtered.length === 0 ? (
                    <li className="px-3 py-3 text-sm text-muted-foreground">
                      No farms available.
                    </li>
                  ) : (
                    filtered.map((o) => (
                      <li key={o.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(o.id);
                            setOpen(false);
                            setQ("");
                          }}
                          className={[
                            "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted",
                            selected === o.id && "bg-accent/10",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          <span className="font-semibold text-foreground">
                            {o.address}
                          </span>
                          <span className="label-mono text-muted-foreground">
                            {o.id} · {o.size} ha
                          </span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selected}
            onClick={() => selected && onSelect(selected)}
          >
            Add Farm
          </Button>
        </div>
      </div>
    </div>
  );
}
