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
import { IconButton, Field, TextInput, Button } from "@/components/ui";
import { fmtDate } from "@/utils/format";
import { DataTable as SharedDataTable } from "@/components/dashboard";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";

const CATEGORY_OPTIONS = [
  "Coffee Seedlings",
  "Coffee Cherries",
  "Fertilizer",
  "Coffee Beans",
];

const VARIETY_OPTIONS = ["Arabica", "Robusta", "Liberica", "Excelsa"];

const FARM_OPTIONS = [
  "FM-001 \xB7 Sitio Malusak, Boac, Marinduque",
  "FM-002 \xB7 Barangay Tugos, Mogpog, Marinduque",
  "FM-003 \xB7 Sitio Hinapulan, Gasan, Marinduque",
  "FM-004 \xB7 Barangay Balogo, Mogpog, Marinduque",
  "FM-005 \xB7 Sitio Bayuti, Torrijos, Marinduque",
];

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
    id: "HV-001",
    name: "Spring Arabica Lot A",
    category: "Coffee Seedlings",
    variety: "Arabica",
    yieldKg: 820,
    farm: "FM-001 \xB7 Sitio Malusak, Boac, Marinduque",
    farmer: "FR-001 \xB7 Lina Okoro",
    harvestedAt: "2026-05-12",
  },
  {
    id: "HV-002",
    name: "Robusta Cycle 2",
    category: "Coffee Cherries",
    variety: "Robusta",
    yieldKg: 540,
    farm: "FM-002 \xB7 Barangay Tugos, Mogpog, Marinduque",
    farmer: "FR-002 \xB7 Samuel Mwangi",
    harvestedAt: "2026-06-02",
  },
  {
    id: "HV-003",
    name: "Liberica Field Pick",
    category: "Fertilizer",
    variety: "Liberica",
    yieldKg: 310,
    farm: "FM-003 \xB7 Sitio Hinapulan, Gasan, Marinduque",
    farmer: "FR-004 \xB7 Chidi Okafor",
    harvestedAt: "2026-04-18",
  },
];

export function HarvestPage() {
  const { role } = useAuth();
  const isManager = role === ROLES.MANAGER || role === ROLES.KALUPPA;
  const isViewOnly = role === ROLES.DTI;

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
        category: CATEGORY_OPTIONS[0],
        variety: VARIETY_OPTIONS[0],
        yieldKg: 0,
        farm: "",
        farmer: "",
        harvestedAt: new Date().toISOString().slice(0, 10),
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
        {!isViewOnly && (
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" /> Add Harvest
          </Button>
        )}
      </div>

      <DataTable
        rows={rows}
        isViewOnly={isViewOnly}
        onEdit={(r) => setModal({ mode: "edit", data: { ...r } })}
        onDelete={(r) => setConfirmDelete(r)}
      />

      {modal && !isViewOnly && (
        <HarvestModal
          mode={modal.mode}
          initial={modal.data}
          isManager={isManager}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {confirmDelete && !isViewOnly && (
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

function DataTable({ rows, isViewOnly = false, onEdit, onDelete }) {
  return (
    <SharedDataTable
      rows={rows}
      columns={[
        {
          key: "name",
          label: "Coffee",
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
          render: (row) => (
            <span className="text-foreground">{row.category}</span>
          ),
        },
        {
          key: "variety",
          label: "Variety",
          render: (row) => (
            <span className="text-foreground">{row.variety || "—"}</span>
          ),
        },
        {
          key: "yieldKg",
          label: "Yielded (kg)",
          render: (row) => (
            <span className="text-foreground">
              {row.yieldKg.toLocaleString()} kg
            </span>
          ),
        },
        {
          key: "harvestedAt",
          label: "Harvested At",
          render: (row) => (
            <span className="text-foreground">{fmtDate(row.harvestedAt)}</span>
          ),
        },
        {
          key: "actions",
          label: "",
          align: "right",
          render: (row) =>
            isViewOnly ? (
              <div className="flex items-center justify-end text-muted-foreground">
                —
              </div>
            ) : (
              <div className="flex items-center justify-end gap-1">
                <IconButton
                  icon={Pencil}
                  label="Edit"
                  onClick={() => onEdit(row)}
                />
                <IconButton
                  icon={Trash2}
                  label="Delete"
                  tone="danger"
                  onClick={() => onDelete(row)}
                />
              </div>
            ),
        },
      ]}
      searchKeys={[
        (row, query) =>
          row.name.toLowerCase().includes(query) ||
          row.id.toLowerCase().includes(query),
      ]}
      searchPlaceholder="Search by name or ID…"
      filters={[
        {
          key: "category",
          initialValue: "all",
          options: [
            { value: "all", label: "All Categories" },
            ...CATEGORY_OPTIONS.map((value) => ({ value, label: value })),
          ],
          matcher: (row, value) => row.category === value,
        },
      ]}
      emptyTitle="No harvests found"
      emptyDescription="Try adjusting your search or add a new harvest."
      minWidth="820px"
    />
  );
}

function HarvestModal({ mode, initial, isManager, onClose, onSave }) {
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
            <Field label="Variety">
              <div className="relative">
                <select
                  value={form.variety}
                  onChange={(e) => set("variety", e.target.value)}
                  className="w-full appearance-none border border-border bg-background py-2.5 pl-3 pr-9 text-sm text-foreground outline-none focus:border-foreground"
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
            <Field label="Yielded (kg)" full>
              <TextInput
                type="number"
                value={String(form.yieldKg)}
                onChange={(v) => set("yieldKg", Number(v))}
                placeholder="0"
              />
            </Field>
            <Field label="Farm" full>
              <SearchSelect
                value={form.farm}
                onChange={(v) => set("farm", v)}
                options={FARM_OPTIONS}
                placeholder="Select a farm…"
                searchPlaceholder="Search farms…"
              />
            </Field>

            {isManager && (
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
