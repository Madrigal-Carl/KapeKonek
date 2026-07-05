import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Image as ImageIcon,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  Button,
  Field,
  IconButton,
  TextInput,
  FormatDate,
} from "@/components/ui";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";

const DEFAULT_PASSWORD = "KapeKonek123";

const SEED = [
  {
    id: "FR-001",
    fullName: "Lina Okoro",
    email: "lina.okoro@kapekonek.ph",
    farmCount: 2,
    status: "approved",
    joinedAt: "2026-01-04",
    files: [
      {
        name: "Valid_ID.jpg",
        type: "image",
        size: 184320,
        url: "https://picsum.photos/seed/fr001-id/800/500",
      },
      { name: "Business_Permit.pdf", type: "pdf", size: 245760 },
    ],
  },
  {
    id: "FR-002",
    fullName: "Samuel Mwangi",
    email: "samuel.mwangi@kapekonek.ph",
    farmCount: 1,
    status: "approved",
    joinedAt: "2026-01-18",
    files: [
      {
        name: "Valid_ID.jpg",
        type: "image",
        size: 176210,
        url: "https://picsum.photos/seed/fr002-id/800/500",
      },
    ],
  },
  {
    id: "FR-003",
    fullName: "Aisha Bello",
    email: "aisha.bello@kapekonek.ph",
    farmCount: 3,
    status: "pending",
    joinedAt: "2026-05-22",
    files: [
      {
        name: "Valid_ID.jpg",
        type: "image",
        size: 201340,
        url: "https://picsum.photos/seed/fr003-id/800/500",
      },
      { name: "Land_Title.pdf", type: "pdf", size: 512000 },
      {
        name: "Farm_Photo.jpg",
        type: "image",
        size: 298400,
        url: "https://picsum.photos/seed/fr003-farm/800/500",
      },
    ],
  },
  {
    id: "FR-004",
    fullName: "Chidi Okafor",
    email: "chidi.okafor@kapekonek.ph",
    farmCount: 1,
    status: "pending",
    joinedAt: "2026-06-01",
    files: [
      {
        name: "Valid_ID.jpg",
        type: "image",
        size: 168900,
        url: "https://picsum.photos/seed/fr004-id/800/500",
      },
      { name: "Business_Permit.pdf", type: "pdf", size: 233480 },
    ],
  },
  {
    id: "FR-005",
    fullName: "Joseph Kamau",
    email: "joseph.kamau@kapekonek.ph",
    farmCount: 2,
    status: "approved",
    joinedAt: "2025-11-14",
    files: [
      {
        name: "Valid_ID.jpg",
        type: "image",
        size: 190220,
        url: "https://picsum.photos/seed/fr005-id/800/500",
      },
    ],
  },
  {
    id: "FR-006",
    fullName: "Mariam Diallo",
    email: "mariam.diallo@kapekonek.ph",
    farmCount: 0,
    status: "denied",
    joinedAt: "2026-03-09",
    files: [
      {
        name: "Valid_ID.jpg",
        type: "image",
        size: 155600,
        url: "https://picsum.photos/seed/fr006-id/800/500",
      },
    ],
  },
  {
    id: "FR-007",
    fullName: "Noah Santos",
    email: "noah.santos@kapekonek.ph",
    farmCount: 1,
    status: "pending",
    joinedAt: "2026-06-20",
    files: [
      {
        name: "Valid_ID.jpg",
        type: "image",
        size: 172000,
        url: "https://picsum.photos/seed/fr007-id/800/500",
      },
      { name: "Business_Permit.pdf", type: "pdf", size: 264000 },
      { name: "Land_Title.pdf", type: "pdf", size: 498000 },
    ],
  },
];

const STATUS_META = {
  pending: {
    label: "Pending",
    cls: "border-[#b8860b] bg-[#fff7e6] text-foreground",
    dot: "bg-[#b8860b]",
  },
  approved: {
    label: "Approved",
    cls: "border-accent bg-accent/10 text-foreground",
    dot: "bg-accent",
  },
  denied: {
    label: "Denied",
    cls: "border-destructive bg-destructive/10 text-foreground",
    dot: "bg-destructive",
  },
};

function StatusPill({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 border-l-2 px-2.5 py-1 text-xs font-semibold",
        m.cls,
      ].join(" ")}
    >
      <span className={["h-1.5 w-1.5", m.dot].join(" ")} />
      {m.label}
    </span>
  );
}

export function FarmersPage() {
  const { role } = useAuth();
  const isManager = role === ROLES.MANAGER;
  const isDti = role === ROLES.DTI;
  // Manager: full CRUD only, no approve/deny. DTI: approve/deny only, no CRUD.
  const canManage = isManager;
  const canReview = isDti;

  const [rows, setRows] = useState(SEED);
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmStatus, setConfirmStatus] = useState(null);

  const nextId = () => `FR-${String(rows.length + 1).padStart(3, "0")}`;

  const handleSave = (data) => {
    setRows((r) => {
      const exists = r.find((x) => x.id === data.id);
      if (exists)
        return r.map((x) => (x.id === data.id ? { ...x, ...data } : x));
      return [
        ...r,
        {
          ...data,
          farmCount: 0,
          status: "pending",
          joinedAt: new Date().toISOString().slice(0, 10),
        },
      ];
    });
    setModal(null);
  };

  const setStatus = (id, status) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));

  return (
    <div className="py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div className="min-w-0">
          <p className="label-mono mb-2 text-accent">Records</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Farmers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isDti
              ? "Review and act on farmer applications."
              : "Registered farmer profiles, approval status, and farm assignments."}
          </p>
        </div>
        {canManage && (
          <Button
            onClick={() =>
              setModal({
                mode: "add",
                data: {
                  id: nextId(),
                  fullName: "",
                  email: "",
                  password: DEFAULT_PASSWORD,
                  files: [],
                },
              })
            }
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Add Farmer
          </Button>
        )}
      </div>

      <DataTable
        rows={rows}
        canManage={canManage}
        canReview={canReview}
        onEdit={(r) =>
          setModal({
            mode: "edit",
            data: { ...r, password: DEFAULT_PASSWORD, files: [] },
          })
        }
        onDelete={(r) => setConfirmDelete(r)}
        onApprove={(r) => setConfirmStatus({ row: r, action: "approve" })}
        onDeny={(r) => setConfirmStatus({ row: r, action: "deny" })}
      />

      {modal && canManage && (
        <FarmerModal
          mode={modal.mode}
          initial={modal.data}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {confirmDelete && canManage && (
        <DeleteConfirm
          name={confirmDelete.fullName}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            setRows((r) => r.filter((x) => x.id !== confirmDelete.id));
            setConfirmDelete(null);
          }}
        />
      )}

      {confirmStatus && (
        <ReviewModal
          row={confirmStatus.row}
          action={confirmStatus.action}
          onCancel={() => setConfirmStatus(null)}
          onConfirm={() => {
            setStatus(
              confirmStatus.row.id,
              confirmStatus.action === "approve" ? "approved" : "denied",
            );
            setConfirmStatus(null);
          }}
        />
      )}
    </div>
  );
}

function DataTable({
  rows,
  canManage,
  canReview,
  onEdit,
  onDelete,
  onApprove,
  onDeny,
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filtered = useMemo(() => {
    let r = rows;
    if (query) {
      const q = query.toLowerCase();
      r = r.filter(
        (x) =>
          x.fullName.toLowerCase().includes(q) ||
          x.email.toLowerCase().includes(q) ||
          x.id.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") r = r.filter((x) => x.status === statusFilter);
    return r;
  }, [rows, query, statusFilter]);

  useEffect(() => setPage(1), [query, statusFilter]);

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
        <div className="relative min-w-[160px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full appearance-none border border-border bg-background py-2.5 pl-3 pr-9 text-sm text-foreground outline-none focus:border-foreground"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="relative w-full overflow-auto">
        <table className="w-full min-w-[720px] caption-bottom border-collapse text-sm">
          <thead className="bg-muted/60">
            <tr>
              {[
                { k: "fullName", l: "Farmer" },
                { k: "farmCount", l: "Farms" },
                { k: "status", l: "Status" },
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
                <td colSpan={5} className="px-4 py-16 text-center">
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center border border-border bg-muted">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="font-semibold text-foreground">
                    No farmers found
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search
                    {canManage ? " or add a new farmer." : "."}
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
                  <td className="px-4 py-3.5 text-foreground">{r.farmCount}</td>
                  <td className="px-4 py-3.5">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="px-4 py-3.5 text-foreground">
                    {FormatDate(r.joinedAt)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {canReview && r.status === "pending" ? (
                        <>
                          <IconButton
                            icon={Check}
                            label="Approve"
                            onClick={() => onApprove(r)}
                          />
                          <IconButton
                            icon={X}
                            label="Deny"
                            tone="danger"
                            onClick={() => onDeny(r)}
                          />
                        </>
                      ) : canManage ? (
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
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
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

function FarmerModal({ mode, initial, onClose, onSave }) {
  const [form, setForm] = useState(initial);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const timersRef = useRef({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((id) => clearInterval(id));
    };
  }, []);

  const startUpload = (file) => {
    const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setFiles((prev) => [
      ...prev,
      { id, name: file.name, size: file.size, progress: 0 },
    ]);
    const timer = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f;
          const next = Math.min(100, f.progress + Math.random() * 18 + 6);
          if (next >= 100) {
            clearInterval(timer);
            delete timersRef.current[id];
          }
          return { ...f, progress: next };
        }),
      );
    }, 250);
    timersRef.current[id] = timer;
  };

  const onPickFiles = (e) => {
    const list = Array.from(e.target.files ?? []);
    list.forEach(startUpload);
    e.target.value = "";
  };

  const removeFile = (id) => {
    const t = timersRef.current[id];
    if (t) {
      clearInterval(t);
      delete timersRef.current[id];
    }
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

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
            <p className="label-mono mb-1 text-accent">Farmer</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {mode === "add" ? "Add New Farmer" : `Edit ${initial.fullName}`}
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

            <Field label="Attachments" full>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-border bg-muted/30 px-4 py-6 text-center hover:bg-muted/50"
              >
                <Upload className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm font-medium text-foreground">
                  Click to upload files
                </div>
                <div className="text-xs text-muted-foreground">
                  PDF, images, or documents
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={onPickFiles}
                />
              </div>

              {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {files.map((f) => (
                    <li
                      key={f.id}
                      className="border border-border bg-background p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-foreground">
                            {f.name}
                          </div>
                          <div className="label-mono text-muted-foreground">
                            {(f.size / 1024).toFixed(1)} KB ·{" "}
                            {Math.floor(f.progress)}%
                            {f.progress >= 100 ? " · done" : " · uploading"}
                          </div>
                        </div>
                        <IconButton
                          icon={X}
                          label="Remove"
                          onClick={() => removeFile(f.id)}
                        />
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden bg-muted">
                        <div
                          className="h-full bg-accent transition-[width] duration-200"
                          style={{ width: `${f.progress}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Field>
          </div>
        </form>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={submit}>
            {mode === "add" ? "Add Farmer" : "Save Changes"}
          </Button>
        </div>
      </div>
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
          Delete farmer?
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

function ReviewModal({ row, action, onCancel, onConfirm }) {
  const isApprove = action === "approve";
  const [preview, setPreview] = useState(null);
  const files = row.files ?? [];

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !preview && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, preview]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-40 p-4"
      onClick={onCancel}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="label-mono mb-1 text-accent">
              {isApprove ? "Approve Application" : "Deny Application"}
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Review Farmer Details
            </h2>
          </div>
          <IconButton icon={X} label="Close" onClick={onCancel} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-4 border border-border bg-muted/30 p-4">
            <div>
              <p className="label-mono mb-1 text-muted-foreground">Full Name</p>
              <p className="text-sm font-semibold text-foreground">
                {row.fullName}
              </p>
            </div>
            <div>
              <p className="label-mono mb-1 text-muted-foreground">Email</p>
              <p className="text-sm font-semibold text-foreground">
                {row.email}
              </p>
            </div>
            <div>
              <p className="label-mono mb-1 text-muted-foreground">Farmer ID</p>
              <p className="text-sm font-semibold text-foreground">{row.id}</p>
            </div>
            <div>
              <p className="label-mono mb-1 text-muted-foreground">Applied</p>
              <p className="text-sm font-semibold text-foreground">
                {FormatDate(row.joinedAt)}
              </p>
            </div>
          </div>

          <p className="label-mono mb-2 mt-5 text-muted-foreground">
            Attachments ({files.length})
          </p>
          {files.length === 0 ? (
            <div className="border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
              No attachments submitted
            </div>
          ) : (
            <ul className="space-y-2">
              {files.map((f, i) => {
                const Icon = f.type === "image" ? ImageIcon : FileText;
                return (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between gap-3 border border-border bg-background p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center border border-border bg-muted">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-foreground">
                          {f.name}
                        </div>
                        <div className="label-mono text-muted-foreground">
                          {(f.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="h-8 gap-1.5 px-3 text-xs"
                      onClick={() => setPreview(f)}
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-border bg-muted/40 px-6 py-4">
          <p className="text-sm text-muted-foreground">
            {isApprove ? (
              <>
                <span className="font-semibold text-foreground">
                  {row.fullName}
                </span>{" "}
                will be marked as approved and granted full access to the
                platform.
              </>
            ) : (
              <>
                <span className="font-semibold text-foreground">
                  {row.fullName}
                </span>{" "}
                will be marked as denied and remain limited to basic platform
                access.
              </>
            )}
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant={isApprove ? "default" : "destructive"}
              onClick={onConfirm}
            >
              {isApprove ? "Approve" : "Deny"}
            </Button>
          </div>
        </div>
      </div>

      {preview && (
        <FilePreviewModal file={preview} onClose={() => setPreview(null)} />
      )}
    </div>
  );
}

function FilePreviewModal({ file, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground-40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
          <p className="truncate text-sm font-semibold text-foreground">
            {file.name}
          </p>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>
        <div className="flex-1 overflow-auto bg-muted/20 p-4">
          {file.type === "image" ? (
            <img
              src={file.url}
              alt={file.name}
              className="mx-auto max-h-[60vh] w-auto border border-border object-contain"
            />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-3 border border-dashed border-border text-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                Preview not available for this file type
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
