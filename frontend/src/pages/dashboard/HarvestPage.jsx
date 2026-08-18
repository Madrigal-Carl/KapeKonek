import { useState } from "react";
import { Archive, Eye, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { fmtDate } from "@/utils/format";
import { DataTable, RowActions } from "@/components/dashboard";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { useDeleteHarvest, useHarvests } from "@/hooks/useHarvests";
import { HARVEST_VARIETY_OPTIONS } from "@/schemas/harvest.schema";
import { HarvestModal, ArchiveConfirmModal } from "@/components/modals";

const capitalize = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";

export function HarvestPage() {
  const { role } = useAuth();
  const isViewOnly = role === ROLES.DTI;

  const { data: harvests = [], isLoading } = useHarvests({ all: true });
  const deleteHarvest = useDeleteHarvest();

  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const columns = [
    {
      key: "farm",
      label: "Farm",
      render: (row) => (
        <>
          <div className="font-semibold text-foreground">
            {row.farm?.propertyNumber ?? "—"}
          </div>
          <div className="label-mono text-muted-foreground">
            {row.farm?.address ?? ""}
          </div>
        </>
      ),
    },
    {
      key: "variety",
      label: "Variety",
      render: (row) => <span className="text-foreground">{capitalize(row.variety)}</span>,
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
      key: "farmer",
      label: "Farmer",
      render: (row) => (
        <span className="text-foreground">
          {row.farmer?.fullName ?? "—"}
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
      render: (row) => (
        <RowActions
          actions={[
            {
              key: "view",
              label: "View",
              icon: Eye,
              onClick: () => setModal({ mode: "view", data: { ...row } }),
            },
            ...(!isViewOnly
              ? [
                  {
                    key: "edit",
                    label: "Edit",
                    icon: Pencil,
                    onClick: () => setModal({ mode: "edit", data: { ...row } }),
                  },
                  {
                    key: "archive",
                    label: "Archive",
                    icon: Archive,
                    danger: true,
                    onClick: () => setConfirmDelete(row),
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];

  const filters = [
    {
      key: "variety",
      initialValue: "all",
      options: [
        { value: "all", label: "All Varieties" },
        ...HARVEST_VARIETY_OPTIONS.map((v) => ({
          value: v.value,
          label: v.label,
        })),
      ],
      matcher: (row, value) => row.variety === value,
    },
  ];

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
          <Button onClick={() => setModal({ mode: "add", data: null })} className="gap-2">
            <Plus className="h-4 w-4" /> Add Harvest
          </Button>
        )}
      </div>

      <DataTable
        rows={harvests}
        columns={columns}
        searchKeys={[
          (row, query) =>
            (row.farm?.propertyNumber ?? "").toLowerCase().includes(query) ||
            (row.farm?.address ?? "").toLowerCase().includes(query) ||
            (row.farmer?.fullName ?? "").toLowerCase().includes(query) ||
            (row.variety ?? "").toLowerCase().includes(query),
        ]}
        searchPlaceholder="Search by farm, farmer, or variety…"
        filters={filters}
        getRowKey={(row) => row._id}
        loading={isLoading}
        emptyTitle="No harvests found"
        emptyDescription="Try adjusting your search or add a new harvest."
        minWidth="820px"
      />

      {modal && (
        <HarvestModal
          mode={modal.mode}
          initial={modal.data}
          onClose={() => setModal(null)}
        />
      )}

      {confirmDelete && !isViewOnly && (
        <ArchiveConfirmModal
          title="Archive harvest?"
          description={
            <>
              Are you sure you want to archive the{" "}
              <strong className="text-foreground">
                {confirmDelete.variety} harvest
              </strong>{" "}
              on {confirmDelete.farm?.propertyNumber ?? "this farm"}? It will
              no longer appear in active lists.
            </>
          }
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            deleteHarvest.mutate(confirmDelete._id, {
              onSuccess: () => setConfirmDelete(null),
            });
          }}
        />
      )}
    </div>
  );
}
