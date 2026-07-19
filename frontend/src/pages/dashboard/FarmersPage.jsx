import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button, IconButton, FormatDate } from "@/components/ui";
import { DataTable, PageSection, StatusPill } from "@/components/dashboard";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { DEFAULT_PASSWORD } from "@/constants/data";
import {
  FarmerModal,
  DeleteConfirmModal,
  AccountReviewModal,
  AssociationReviewModal,
} from "@/components/modals";

const SEED = [
  {
    id: "FR-001",
    fullName: "Lina Okoro",
    email: "lina.okoro@kapekonek.ph",
    farmCount: 2,
    status: "approved",
    associationStatus: "approved",
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
    associationStatus: "pending",
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
    associationStatus: "pending",
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
    associationStatus: "pending",
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
    associationStatus: "approved",
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
    associationStatus: "denied",
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
    associationStatus: "pending",
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

export function FarmersPage() {
  const { role } = useAuth();
  const isManager = role === ROLES.MANAGER;
  const isDti = role === ROLES.DTI;

  // Manager: full CRUD + approve/deny the association application (simple confirm, no attachments).
  // DTI: approve/deny the account application (full review w/ submitted documents), no CRUD.
  const canManage = isManager;
  const canReviewAccount = isDti;
  const canReviewAssociation = isManager;

  const [rows, setRows] = useState(SEED);
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmAccount, setConfirmAccount] = useState(null);
  const [confirmAssociation, setConfirmAssociation] = useState(null);

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
          associationStatus: "pending",
          joinedAt: new Date().toISOString().slice(0, 10),
        },
      ];
    });
    setModal(null);
  };

  const setStatus = (id, status) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));

  const setAssociationStatus = (id, associationStatus) =>
    setRows((r) =>
      r.map((x) => (x.id === id ? { ...x, associationStatus } : x)),
    );

  const onEdit = (r) =>
    setModal({
      mode: "edit",
      data: { ...r, password: DEFAULT_PASSWORD, files: [] },
    });
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
            {r.id} · {r.email}
          </div>
        </>
      ),
    },
    { key: "farmCount", label: "Farms" },
    {
      key: "status",
      label: "Account",
      render: (r) => <StatusPill status={r.status} />,
    },
    {
      key: "associationStatus",
      label: "Association",
      render: (r) => <StatusPill status={r.associationStatus} />,
    },
    {
      key: "joinedAt",
      label: "Joined At",
      render: (r) => FormatDate(r.joinedAt),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (r) => {
        const showAccountActions = canReviewAccount && r.status === "pending";
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
                  icon={Trash2}
                  label="Delete"
                  tone="danger"
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
      key: "status",
      initialValue: "all",
      options: [
        { value: "all", label: "All Statuses" },
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "denied", label: "Denied" },
      ],
      matcher: (row, value) => row.status === value,
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
        columns={columns}
        searchKeys={["fullName", "email", "id"]}
        searchPlaceholder="Search by name, email, or ID…"
        filters={filters}
        pageSize={5}
        getRowKey={(r) => r.id}
        minWidth="860px"
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
          onSave={handleSave}
        />
      )}

      {confirmDelete && canManage && (
        <DeleteConfirmModal
          name={confirmDelete.fullName}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            setRows((r) => r.filter((x) => x.id !== confirmDelete.id));
            setConfirmDelete(null);
          }}
        />
      )}

      {confirmAccount && canReviewAccount && (
        <AccountReviewModal
          row={confirmAccount.row}
          action={confirmAccount.action}
          onCancel={() => setConfirmAccount(null)}
          onConfirm={() => {
            setStatus(
              confirmAccount.row.id,
              confirmAccount.action === "approve" ? "approved" : "denied",
            );
            setConfirmAccount(null);
          }}
        />
      )}

      {confirmAssociation && canReviewAssociation && (
        <AssociationReviewModal
          row={confirmAssociation.row}
          action={confirmAssociation.action}
          onCancel={() => setConfirmAssociation(null)}
          onConfirm={() => {
            setAssociationStatus(
              confirmAssociation.row.id,
              confirmAssociation.action === "approve" ? "approved" : "denied",
            );
            setConfirmAssociation(null);
          }}
        />
      )}
    </div>
  );
}
