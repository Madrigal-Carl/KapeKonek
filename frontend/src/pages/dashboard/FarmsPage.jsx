import { useState } from "react";
import { Archive, DoorOpen, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { DataTable, RowActions } from "@/components/dashboard";
import useAuth from "@/hooks/useAuth";
import {
  useDeleteFarm,
  useFarms,
  useJoinableFarms,
  useJoinFarm,
  useLeaveFarm,
} from "@/hooks/useFarms";
import { ROLES } from "@/constants/roles";
import { fmtDate } from "@/utils/format";
import {
  AddChooserModal,
  ArchiveConfirmModal,
  ExistingFarmModal,
  FarmModal,
} from "@/components/modals";

export function FarmsPage() {
  const { role, user } = useAuth();
  const isFarmer = role === ROLES.FARMER;
  const isManager = role === ROLES.MANAGER;
  const isKaluppa = role === ROLES.KALUPPA;
  const canManageAll = isManager || isKaluppa;

  const { data: farms = [], isLoading } = useFarms({ all: true });
  const { data: joinableFarms = [] } = useJoinableFarms({ enabled: isFarmer });
  const deleteFarm = useDeleteFarm();
  const joinFarm = useJoinFarm();
  const leaveFarm = useLeaveFarm();

  const [modal, setModal] = useState(null);
  const [addChooserOpen, setAddChooserOpen] = useState(false);
  const [existingOpen, setExistingOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmLeave, setConfirmLeave] = useState(null);

  const canEdit = (r) =>
    canManageAll || (isFarmer && r.owner?._id === user?._id);

  const openAddNew = () => setModal({ mode: "add", data: null });

  const columns = [
    {
      key: "propertyNumber",
      label: "Property Number",
      render: (r) => (
        <>
          <div className="font-semibold text-foreground">{r.propertyNumber}</div>
          <div className="label-mono text-muted-foreground">{r.address}</div>
        </>
      ),
    },
    {
      key: "size",
      label: "Size (ha)",
      render: (r) => `${r.size} ha`,
    },
    {
      key: "assignedFarmers",
      label: "Farmers",
      render: (r) => r.assignedFarmers?.length ?? 0,
    },
    {
      key: "createdAt",
      label: "Joined At",
      render: (r) => fmtDate(r.createdAt),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (r) => {
        if (canEdit(r)) {
          return (
            <RowActions
              actions={[
                {
                  key: "edit",
                  label: "Edit",
                  icon: Pencil,
                  onClick: () => setModal({ mode: "edit", data: r }),
                },
                {
                  key: "archive",
                  label: "Archive",
                  icon: Archive,
                  danger: true,
                  onClick: () => setConfirmDelete(r),
                },
              ]}
            />
          );
        }

        if (isFarmer) {
          return (
            <RowActions
              actions={[
                {
                  key: "leave",
                  label: "Leave Farm",
                  icon: DoorOpen,
                  danger: true,
                  onClick: () => setConfirmLeave(r),
                },
              ]}
            />
          );
        }

        return <span className="text-muted-foreground">—</span>;
      },
    },
  ];

  const filters = [
    {
      key: "size",
      initialValue: "all",
      options: [
        { value: "all", label: "All Sizes" },
        { value: "0-2", label: "0 – 2 ha" },
        { value: "2-5", label: "2 – 5 ha" },
        { value: "5-10", label: "5 – 10 ha" },
        { value: "10-999", label: "10+ ha" },
      ],
      matcher: (row, value) => {
        const [min, max] = value
          .split("-")
          .map((n) => (n ? parseFloat(n) : Infinity));
        return row.size >= min && row.size < max;
      },
    },
  ];

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
        <Button
          onClick={() =>
            isFarmer ? setAddChooserOpen(true) : openAddNew()
          }
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add Farm
        </Button>
      </div>

      <DataTable
        rows={farms}
        columns={columns}
        searchKeys={["propertyNumber", "address", ["owner", "fullName"]]}
        searchPlaceholder="Search by property number, address, or owner…"
        filters={filters}
        getRowKey={(r) => r._id}
        minWidth="720px"
        loading={isLoading}
        emptyTitle="No farms found"
        emptyDescription="Try adjusting your search or add a new farm."
      />

      {modal && (
        <FarmModal
          mode={modal.mode}
          initial={modal.data}
          onClose={() => setModal(null)}
        />
      )}

      {addChooserOpen && (
        <AddChooserModal
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
          options={joinableFarms}
          onClose={() => setExistingOpen(false)}
          onSelect={(farmId) =>
            joinFarm.mutate(farmId, { onSuccess: () => setExistingOpen(false) })
          }
        />
      )}

      {confirmDelete && (
        <ArchiveConfirmModal
          title="Archive farm?"
          description={
            <>
              Are you sure you want to archive{" "}
              <strong className="text-foreground">
                {confirmDelete.propertyNumber} ({confirmDelete.address})
              </strong>
              ? It will no longer appear in active lists.
            </>
          }
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            deleteFarm.mutate(confirmDelete._id, {
              onSuccess: () => setConfirmDelete(null),
            });
          }}
        />
      )}

      {confirmLeave && (
        <ArchiveConfirmModal
          title="Leave farm?"
          confirmLabel="Leave"
          description={
            <>
              Are you sure you want to leave{" "}
              <strong className="text-foreground">
                {confirmLeave.propertyNumber} ({confirmLeave.address})
              </strong>
              ? You will be removed from this farm&apos;s assigned farmers.
            </>
          }
          onCancel={() => setConfirmLeave(null)}
          onConfirm={() => {
            leaveFarm.mutate(confirmLeave._id, {
              onSuccess: () => setConfirmLeave(null),
            });
          }}
        />
      )}
    </div>
  );
}
