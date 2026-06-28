import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
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

const CATEGORY_OPTIONS = ["Arabica", "Robusta", "Liberica", "Excelsa"];
const FARM_OPTIONS = [
  "FM-001 \xB7 Sitio Malusak, Boac, Marinduque",
  "FM-002 \xB7 Barangay Tugos, Mogpog, Marinduque",
  "FM-003 \xB7 Sitio Hinapulan, Gasan, Marinduque",
  "FM-004 \xB7 Barangay Balogo, Mogpog, Marinduque",
  "FM-005 \xB7 Sitio Bayuti, Torrijos, Marinduque",
];
const SEED = [
  {
    id: "HV-001",
    name: "Spring Arabica Lot A",
    category: "Arabica",
    yieldKg: 820,
    farm: "FM-001 \xB7 Sitio Malusak, Boac, Marinduque",
    harvestedAt: "2026-05-12",
  },
  {
    id: "HV-002",
    name: "Robusta Cycle 2",
    category: "Robusta",
    yieldKg: 540,
    farm: "FM-002 \xB7 Barangay Tugos, Mogpog, Marinduque",
    harvestedAt: "2026-06-02",
  },
  {
    id: "HV-003",
    name: "Liberica Field Pick",
    category: "Liberica",
    yieldKg: 310,
    farm: "FM-003 \xB7 Sitio Hinapulan, Gasan, Marinduque",
    harvestedAt: "2026-04-18",
  },
];
export function HarvestPage() {
  const [rows, setRows] = useState(SEED);
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const nextId = () => `HV-${String(rows.length + 1).padStart(3, "0")}`;
  const openAdd = () =>
    setModal({
      mode: "add",
      data: {
        id: nextId(),
        name: "",
        category: "Arabica",
        yieldKg: 0,
        farm: "",
        harvestedAt: /* @__PURE__ */ new Date().toISOString().slice(0, 10),
      },
    });
  const handleSave = (data) => {
    setRows((r) => {
      const cleaned = {
        ...data,
        yieldKg: Number(data.yieldKg) || 0,
      };
      const exists = r.find((x) => x.id === data.id);
      if (exists) return r.map((x) => (x.id === data.id ? cleaned : x));
      return [...r, cleaned];
    });
    setModal(null);
  };
  return (
    <div className="py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div className="min-w-0">
          <p className="label-mono mb-2 text-accent">Records</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Harvest
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track yields and harvest history across your farms.
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Harvest
        </Button>
      </div>

      <DataTable
        rows={rows}
        onEdit={(r) => setModal({ mode: "edit", data: { ...r } })}
        onDelete={(r) => setConfirmDelete(r)}
      />

      {modal && (
        <HarvestModal
          mode={modal.mode}
          initial={modal.data}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {confirmDelete && (
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
function DataTable({ rows, onEdit, onDelete }) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
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
          x.name.toLowerCase().includes(q) || x.id.toLowerCase().includes(q),
      );
    }
    if (categoryFilter !== "all") {
      r = r.filter((x) => x.category === categoryFilter);
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
  }, [rows, query, categoryFilter, sortKey, sortDir]);
  useEffect(() => setPage(1), [query, categoryFilter]);
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
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full flex-1 sm:min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or ID…"
            className="w-full border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground"
          />
        </div>
        <div className="relative w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full appearance-none border border-border bg-background py-2.5 pl-3 pr-9 text-sm text-foreground outline-none focus:border-foreground sm:w-auto"
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="relative w-full overflow-auto">
        <table className="w-full min-w-[720px] caption-bottom border-collapse text-sm">
          <thead className="bg-muted/60">
            <tr>
              {[
                { k: "name", l: "Coffee", sortable: true },
                { k: "category", l: "Category", sortable: true },
                { k: "yieldKg", l: "Yielded (kg)", sortable: true },
                { k: "harvestedAt", l: "Harvested At", sortable: true },
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
                    No harvests found
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search or add a new harvest.
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
                    {r.yieldKg.toLocaleString()} kg
                  </td>
                  <td className="px-4 py-3.5 text-foreground">
                    {FormatDate(r.harvestedAt)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
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
function HarvestModal({ mode, initial, onClose, onSave }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const submit = (e) => {
    e?.preventDefault();
    if (!form.name || !form.farm) return;
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
            <p className="label-mono mb-1 text-accent">Harvest</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {mode === "add" ? "Add New Harvest" : `Edit ${initial.name}`}
            </h2>
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name" full>
              <TextInput
                value={form.name}
                onChange={(v) => set("name", v)}
                placeholder="e.g. Spring Arabica Lot A"
              />
            </Field>
            <Field label="Category">
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="w-full appearance-none border border-border bg-background py-2.5 pl-3 pr-9 text-sm text-foreground outline-none focus:border-foreground"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </Field>
            <Field label="Yielded (kg)">
              <TextInput
                type="number"
                value={String(form.yieldKg)}
                onChange={(v) => set("yieldKg", Number(v))}
                placeholder="0"
              />
            </Field>
            <Field label="Farm" full>
              <FarmSelect
                value={form.farm}
                onChange={(v) => set("farm", v)}
                options={FARM_OPTIONS}
              />
            </Field>
          </div>
        </form>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => submit()}>
            {mode === "add" ? "Add Harvest" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
function FarmSelect({ value, onChange, options }) {
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
          {value || "Select a farm\u2026"}
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
              placeholder="Search farms…"
              className="w-full bg-card py-2.5 pl-9 pr-3 text-sm outline-none"
            />
          </div>
          <ul className="max-h-56 overflow-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-muted-foreground">
                No farms found.
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
        className="w-full max-w-sm border border-border bg-card p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="mb-1 text-lg font-semibold tracking-tight text-foreground">
          Delete Harvest?
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
