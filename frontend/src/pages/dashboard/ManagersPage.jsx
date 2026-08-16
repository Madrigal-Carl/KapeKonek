import { useState } from "react";
import { Archive, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { fmtDate } from "@/utils/format";
import { DataTable, RowActions } from "@/components/dashboard";
import { DEFAULT_PASSWORD } from "@/constants/data";
import { ManagerModal, ArchiveConfirmModal } from "@/components/modals";
import { useDeleteUser, useUsers } from "@/hooks/useUsers";

export function ManagersPage() {
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data: managers = [], isLoading } = useUsers({
    role: "manager",
    all: true,
  });
  const deleteUser = useDeleteUser();

  const columns = [
    {
      key: "fullName",
      label: "Manager",
      render: (row) => (
        <div>
          <div className="font-semibold text-foreground">{row.fullName}</div>
          <div className="label-mono text-muted-foreground">
            {row._id} · {row.email}
          </div>
        </div>
      ),
    },
    {
      key: "association",
      label: "Association",
      render: (row) => (
        <span className="text-foreground">{row.association || "—"}</span>
      ),
    },
    {
      key: "farmerCount",
      label: "Farmer(s)",
      render: (row) => (
        <span className="text-foreground">{row.farmerCount ?? 0}</span>
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
        <RowActions
          actions={[
            {
              key: "edit",
              label: "Edit",
              icon: Pencil,
              onClick: () =>
                setModal({
                  mode: "edit",
                  data: {
                    ...row,
                    password: DEFAULT_PASSWORD,
                    association: row.association || "",
                    assignedFarmers: row.assignedFarmers || [],
                  },
                }),
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
                lastName: "",
                firstName: "",
                middleName: "",
                username: "",
                email: "",
                contactNumber: "",
                address: "",
                password: DEFAULT_PASSWORD,
                association: "",
                assignedFarmers: [],
              },
            })
          }
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add Manager
        </Button>
      </div>

      <DataTable
        rows={managers}
        columns={columns}
        searchKeys={[
          (row, query) =>
            row.fullName?.toLowerCase().includes(query) ||
            row.email?.toLowerCase().includes(query) ||
            row._id?.toLowerCase().includes(query),
        ]}
        searchPlaceholder="Search by name, email, or ID…"
        emptyTitle="No managers found"
        emptyDescription="Try adjusting your search or add a new manager."
        minWidth="760px"
        loading={isLoading}
      />

      {modal && (
        <ManagerModal
          mode={modal.mode}
          initial={modal.data}
          onClose={() => setModal(null)}
        />
      )}

      {confirmDelete && (
        <ArchiveConfirmModal
          title="Archive manager?"
          description={
            <>
              This will archive{" "}
              <span className="font-semibold text-foreground">
                {confirmDelete.fullName}
              </span>
              . It will no longer appear in active lists.
            </>
          }
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            deleteUser.mutate(confirmDelete._id, {
              onSuccess: () => setConfirmDelete(null),
            });
          }}
        />
      )}
    </div>
  );
}
