import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button, IconButton } from "@/components/ui";
import { fmtDate } from "@/utils/format";
import { DataTable } from "@/components/dashboard";
import { DEFAULT_PASSWORD, MANAGERS } from "@/constants/data";
import { ManagerModal, DeleteConfirmModal } from "@/components/modals";

export function ManagersPage() {
  const [rows, setRows] = useState(MANAGERS);
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

  const columns = [
    {
      key: "fullName",
      label: "Manager",
      render: (row) => (
        <div>
          <div className="font-semibold text-foreground">{row.fullName}</div>
          <div className="label-mono text-muted-foreground">
            {row.id} · {row.email}
          </div>
        </div>
      ),
    },
    {
      key: "joinedAt",
      label: "Joined At",
      render: (row) => (
        <span className="text-foreground">{fmtDate(row.joinedAt)}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton
            icon={Pencil}
            label="Edit"
            onClick={() =>
              setModal({
                mode: "edit",
                data: {
                  ...row,
                  password: DEFAULT_PASSWORD,
                  farmers: row.farmers || [],
                },
              })
            }
          />
          <IconButton
            icon={Trash2}
            label="Delete"
            tone="danger"
            onClick={() => setConfirmDelete(row)}
          />
        </div>
      ),
    },
  ];

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
        columns={columns}
        searchKeys={[
          (row, query) =>
            row.fullName.toLowerCase().includes(query) ||
            row.email.toLowerCase().includes(query) ||
            row.id.toLowerCase().includes(query),
        ]}
        searchPlaceholder="Search by name, email, or ID…"
        emptyTitle="No managers found"
        emptyDescription="Try adjusting your search or add a new manager."
        minWidth="640px"
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
        <DeleteConfirmModal
          title="Delete manager?"
          description={
            <>
              This will permanently remove{" "}
              <span className="font-semibold text-foreground">
                {confirmDelete.fullName}
              </span>
              . This action cannot be undone.
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
