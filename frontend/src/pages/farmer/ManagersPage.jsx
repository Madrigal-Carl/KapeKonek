import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  Button,
  Field,
  IconButton,
  TextInput,
  FormatDate,
} from "@/components/ui";

const DEFAULT_PASSWORD = "KapeKonek123";

const FARMER_OPTIONS = [
  "FR-001 \xB7 Lina Okoro",
  "FR-002 \xB7 Samuel Mwangi",
  "FR-003 \xB7 Aisha Bello",
  "FR-004 \xB7 Chidi Okafor",
  "FR-005 \xB7 Joseph Kamau",
  "FR-006 \xB7 Mariam Diallo",
  "FR-007 \xB7 Noah Santos",
];

const SEED = [
  {
    id: "MG-001",
    fullName: "Rosario Villanueva",
    email: "rosario.villanueva@kapekonek.ph",
    joinedAt: "2025-10-02",
  },
  {
    id: "MG-002",
    fullName: "Emmanuel Torres",
    email: "emmanuel.torres@kapekonek.ph",
    joinedAt: "2025-12-11",
  },
  {
    id: "MG-003",
    fullName: "Grace Fernandez",
    email: "grace.fernandez@kapekonek.ph",
    joinedAt: "2026-02-19",
  },
  {
    id: "MG-004",
    fullName: "Peter Uzoma",
    email: "peter.uzoma@kapekonek.ph",
    joinedAt: "2026-04-07",
  },
  {
    id: "MG-005",
    fullName: "Clarita Mendoza",
    email: "clarita.mendoza@kapekonek.ph",
    joinedAt: "2026-05-30",
  },
];

export function ManagersPage() {
  const [rows, setRows] = useState(SEED);
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const nextId = () => `MG-${String(rows.length + 1).padStart(3, "0")}`;

  const handleSave = (data) => {
    setRows((r) => {
      const exists = r.find((x) => x.id === data.id);
      if (exists)
        return r.map((x) => (x.id === data.id ? { ...x, ...data } : x));
      return [
        ...r,
        {
          ...data,
          joinedAt: new Date().toISOString().slice(0, 10),
        },
      ];
    });
    setModal(null);
  };

  return (
    <div className="py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div className="min-w-0">
          <p className="label-mono mb-2 text-accent">Records</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Managers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registered manager accounts and their access to the platform.
          </p>
        </div>
        <Button
          onClick={() =>
            setModal({
              mode: "add",
              data: {
                id: nextId(),
                fullName: "",
                email: "",
                password: DEFAULT_PASSWORD,
                farmers: [],
              },
            })
          }
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add Manager
        </Button>
      </div>

      <DataTable
        rows={rows}
        onEdit={(r) =>
          setModal({
            mode: "edit",
            data: {
              ...r,
              password: DEFAULT_PASSWORD,
              farmers: r.farmers || [],
            },
          })
        }
        onDelete={(r) => setConfirmDelete(r)}
      />

      {modal && (
        <ManagerModal
          mode={modal.mode}
          initial={modal.data}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {confirmDelete && (
        <DeleteConfirm
          name={confirmDelete.fullName}
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
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filtered = useMemo(() => {
    if (!query) return rows;
    const q = query.toLowerCase();
    return rows.filter(
      (x) =>
        x.fullName.toLowerCase().includes(q) ||
        x.email.toLowerCase().includes(q) ||
        x.id.toLowerCase().includes(q),
    );
  }, [rows, query]);

  useEffect(() => setPage(1), [query]);

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
            placeholder="Search by name, email, or ID…"
            className="w-full border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground"
          />
        </div>
      </div>

      <div className="relative w-full overflow-auto">
        <table className="w-full min-w-[640px] caption-bottom border-collapse text-sm">
          <thead className="bg-muted/60">
            <tr>
              {[
                { k: "fullName", l: "Manager" },
                { k: "joinedAt", l: "Joined At" },
                { k: "actions", l: "", right: true },
              ].map((c) => (
                <th
                  key={c.k}
                  className={[
                    "label-mono px-4 py-3 text-left text-muted-foreground",
                    c.right && "text-right",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {c.l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-16 text-center">
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center border border-border bg-muted">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="font-semibold text-foreground">
                    No managers found
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search or add a new manager.
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
                      {r.fullName}
                    </div>
                    <div className="label-mono text-muted-foreground">
                      {r.id} · {r.email}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-foreground">
                    {FormatDate(r.joinedAt)}
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

function ManagerModal({ mode, initial, onClose, onSave }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e) => {
    e?.preventDefault();
    if (!form.fullName?.trim() || !form.email?.trim()) return;
    onSave({
      ...form,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
    });
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
            <p className="label-mono mb-1 text-accent">Manager</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {mode === "add" ? "Add New Manager" : `Edit ${initial.fullName}`}
            </h2>
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full Name" full>
              <TextInput
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="Juan dela Cruz"
              />
            </Field>
            <Field label="Email" full>
              <TextInput
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="name@kapekonek.ph"
              />
            </Field>
            <Field label="Default Password" full>
              <TextInput
                value={form.password}
                readOnly
                disabled
                className="bg-muted/40"
              />
              {mode === "edit" && (
                <button
                  type="button"
                  onClick={() => set("password", DEFAULT_PASSWORD)}
                  className="mt-2 inline-flex items-center gap-1.5 self-start text-xs font-semibold text-accent hover:underline"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset to default
                  password
                </button>
              )}
            </Field>

            <Field label="Farmer(s)" full>
              <MultiSelect
                values={form.farmers || []}
                onChange={(v) => set("farmers", v)}
                options={FARMER_OPTIONS}
                placeholder="Select farmer(s)…"
              />
            </Field>
          </div>
        </form>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={submit}>
            {mode === "add" ? "Add Manager" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MultiSelect({ values, onChange, options, placeholder }) {
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

  const toggle = (o) =>
    onChange(
      values.includes(o) ? values.filter((v) => v !== o) : [...values, o],
    );

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
              placeholder="Search…"
              className="w-full bg-card py-2.5 pl-9 pr-3 text-sm outline-none"
            />
          </div>
          <ul className="max-h-56 overflow-auto">
            {filtered.length === 0 ? (
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
          </ul>
        </div>
      )}
    </div>
  );
}

function DeleteConfirm({ name, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          Delete manager?
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          This will permanently remove{" "}
          <span className="font-semibold text-foreground">{name}</span>. This
          action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-2">
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
