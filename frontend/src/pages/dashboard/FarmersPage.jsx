import { useState } from "react";
import { Archive, Check, Pencil, Plus, X } from "lucide-react";
import { Button, IconButton } from "@/components/ui";
import { fmtDate } from "@/utils/format";
import { DataTable, StatusPill } from "@/components/dashboard";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { DEFAULT_PASSWORD } from "@/constants/data";
import {
  FarmerModal,
  ArchiveConfirmModal,
  AccountReviewModal,
  AssociationReviewModal,
} from "@/components/modals";
import {
  useDeleteUser,
  useReviewAccount,
  useReviewAssociation,
  useUsers,
} from "@/hooks/useUsers";

export function FarmersPage() {
  const { role } = useAuth();
  const isManager = role === ROLES.MANAGER;
  const isDti = role === ROLES.DTI;

  // Manager: full CRUD + approve/deny the association application (simple confirm, no attachments).
  // DTI: approve/deny the account application (full review w/ submitted documents), no CRUD.
  const canManage = isManager;
  const canReviewAccount = isDti;
  const canReviewAssociation = isManager;

  const { data: farmers = [], isLoading } = useUsers({
    role: "farmer",
    all: true,
  });
  const deleteUser = useDeleteUser();
  const reviewAccount = useReviewAccount();
  const reviewAssociation = useReviewAssociation();

  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmAccount, setConfirmAccount] = useState(null);
  const [confirmAssociation, setConfirmAssociation] = useState(null);

  const onEdit = (r) =>
    setModal({ mode: "edit", data: { ...r, password: DEFAULT_PASSWORD } });
  const onDelete = (r) => setConfirmDelete(r);
  const onApproveAccount = (r) =>
    setConfirmAccount({ row: r, action: "approve" });
  const onDenyAccount = (r) => setConfirmAccount({ row: r, action: "deny" });
  const onApproveAssociation = (r) =>
    setConfirmAssociation({ row: r, action: "approve" });
  const onDenyAssociation = (r) =>
    setConfirmAssociation({ row: r, action: "deny" });

  const columns = [
    {
      key: "fullName",
      label: "Farmer",
      render: (r) => (
        <>
          <div className="font-semibold text-foreground">{r.fullName}</div>
          <div className="label-mono text-muted-foreground">
            {r._id} · {r.email}
          </div>
        </>
      ),
    },
    { key: "farmCount", label: "Farms" },
    {
      key: "accountStatus",
      label: "Account",
      render: (r) =>
        r.accountStatus ? <StatusPill status={r.accountStatus} /> : "—",
    },
    {
      key: "associationStatus",
      label: "Association",
      render: (r) =>
        r.associationStatus ? <StatusPill status={r.associationStatus} /> : "—",
    },
    {
      key: "joinedAt",
      label: "Joined At",
      render: (r) => fmtDate(r.joinedAt),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (r) => {
        const showAccountActions =
          canReviewAccount && r.accountStatus === "pending";
        const showAssociationActions =
          canReviewAssociation && r.associationStatus === "pending";
        const hasAnyAction = showAccountActions || canManage;

        return (
          <div className="flex items-center justify-end gap-1">
            {showAccountActions && (
              <>
                <IconButton
                  icon={Check}
                  label="Approve account"
                  onClick={() => onApproveAccount(r)}
                />
                <IconButton
                  icon={X}
                  label="Deny account"
                  tone="danger"
                  onClick={() => onDenyAccount(r)}
                />
              </>
            )}

            {canManage && (
              <>
                {showAssociationActions && (
                  <>
                    <IconButton
                      icon={Check}
                      label="Approve association"
                      onClick={() => onApproveAssociation(r)}
                    />
                    <IconButton
                      icon={X}
                      label="Deny association"
                      tone="danger"
                      onClick={() => onDenyAssociation(r)}
                    />
                  </>
                )}
                <IconButton
                  icon={Pencil}
                  label="Edit"
                  onClick={() => onEdit(r)}
                />
                <IconButton
                  icon={Archive}
                  label="Archive"
                  onClick={() => onDelete(r)}
                />
              </>
            )}

            {!hasAnyAction && (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </div>
        );
      },
    },
  ];

  const filters = [
    {
      key: "accountStatus",
      initialValue: "all",
      options: [
        { value: "all", label: "All Statuses" },
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
      ],
      matcher: (row, value) => row.accountStatus === value,
    },
  ];

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
              ? "Review and act on farmer account applications."
              : isManager
                ? "Registered farmer profiles, association status, and farm assignments."
                : "Registered farmer profiles, approval status, and farm assignments."}
          </p>
        </div>
        {canManage && (
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
        rows={farmers}
        columns={columns}
        searchKeys={["fullName", "email", "_id"]}
        searchPlaceholder="Search by name, email, or ID…"
        filters={filters}
        pageSize={5}
        getRowKey={(r) => r._id}
        minWidth="860px"
        loading={isLoading}
        emptyTitle="No farmers found"
        emptyDescription={
          canManage
            ? "Try adjusting your search or add a new farmer."
            : "Try adjusting your search."
        }
      />

      {modal && canManage && (
        <FarmerModal
          mode={modal.mode}
          initial={modal.data}
          onClose={() => setModal(null)}
        />
      )}

      {confirmDelete && canManage && (
        <ArchiveConfirmModal
          title="Archive farmer?"
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

      {confirmAccount && canReviewAccount && (
        <AccountReviewModal
          row={confirmAccount.row}
          action={confirmAccount.action}
          onCancel={() => setConfirmAccount(null)}
          onConfirm={(remarks) => {
            reviewAccount.mutate(
              {
                id: confirmAccount.row._id,
                data: {
                  status:
                    confirmAccount.action === "approve" ? "approved" : "rejected",
                  ...(remarks ? { remarks } : {}),
                },
              },
              { onSuccess: () => setConfirmAccount(null) },
            );
          }}
        />
      )}

      {confirmAssociation && canReviewAssociation && (
        <AssociationReviewModal
          row={confirmAssociation.row}
          action={confirmAssociation.action}
          onCancel={() => setConfirmAssociation(null)}
          onConfirm={(remarks) => {
            reviewAssociation.mutate(
              {
                id: confirmAssociation.row._id,
                data: {
                  status:
                    confirmAssociation.action === "approve"
                      ? "approved"
                      : "rejected",
                  ...(remarks ? { remarks } : {}),
                },
              },
              { onSuccess: () => setConfirmAssociation(null) },
            );
          }}
        />
      )}
    </div>
  );
}
