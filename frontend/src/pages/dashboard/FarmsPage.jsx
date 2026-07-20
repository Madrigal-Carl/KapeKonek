import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button, IconButton } from "@/components/ui";
import { DataTable } from "@/components/dashboard";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { EXISTING_FARM_REGISTRY, FARMS } from "@/constants/data";
import { fmtCoord, fmtDate } from "@/utils/format";
import {
  FarmModal,
  AddChooserModal,
  ExistingFarmModal,
  DeleteConfirmModal,
} from "@/components/modals";

export function FarmsPage() {
  const { role } = useAuth();
  const isManager = role === ROLES.MANAGER || role === ROLES.KALUPPA;
  const isViewOnly = role === ROLES.DTI;

  const [rows, setRows] = useState(FARMS);
  const [modal, setModal] = useState(null);
  const [addChooserOpen, setAddChooserOpen] = useState(false);
  const [existingOpen, setExistingOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const nextId = () => `FM-${String(rows.length + 1).padStart(3, "0")}`;

  const openAddNew = () =>
    setModal({
      mode: "add",
      data: {
        id: nextId(),
        address: "",
        size: 0,
        farmers: [],
        associations: [],
        crops: [],
        yieldKg: 0,
        location: null,
        joinedAt: new Date().toISOString().slice(0, 10),
      },
    });

  const attachExisting = (registryId) => {
    const reg = EXISTING_FARM_REGISTRY.find((r) => r.id === registryId);
    if (!reg) return;
    const today = new Date().toISOString().slice(0, 10);
    setRows((r) => [
      ...r,
      {
        id: nextId(),
        address: reg.address,
        size: reg.size,
        farmers: [],
        associations: [],
        crops: [],
        yieldKg: 0,
        location: reg.location,
        joinedAt: today,
        history: [
          { action: "Linked", item: `Existing farm ${reg.id}`, date: today },
        ],
        isExisting: true,
      },
    ]);
    setExistingOpen(false);
  };

  const handleSave = (data) => {
    setRows((r) => {
      const today = new Date().toISOString().slice(0, 10);
      const cleaned = {
        ...data,
        size: Number(data.size) || 0,
        yieldKg: Number(data.yieldKg) || 0,
        crops: (data.crops || []).filter((c) => c.crop),
      };
      const exists = r.find((x) => x.id === data.id);
      if (exists) {
        const prevCrops = exists.crops.map((c) => c.crop);
        const nextCrops = cleaned.crops.map((c) => c.crop);
        const added = nextCrops.filter((x) => !prevCrops.includes(x));
        const harvestedNew = cleaned.crops.filter((c) => {
          const before = exists.crops.find((p) => p.crop === c.crop);
          return (
            c.status === "harvested" &&
            (!before || before.status !== "harvested")
          );
        });
        const newEvents = [
          ...added.map((c) => ({
            action: "Received",
            item: `${c} seeds`,
            date: today,
          })),
          ...harvestedNew.map((c) => ({
            action: "Harvested",
            item: c.crop,
            date: today,
          })),
        ];
        return r.map((x) =>
          x.id === data.id
            ? {
                ...x,
                ...cleaned,
                history: [...(x.history || []), ...newEvents],
              }
            : x,
        );
      }
      return [
        ...r,
        {
          ...cleaned,
          history: cleaned.crops.map((c) => ({
            action: c.status === "harvested" ? "Harvested" : "Received",
            item: c.status === "harvested" ? c.crop : `${c.crop} seeds`,
            date: today,
          })),
        },
      ];
    });
    setModal(null);
  };

  const onEdit = (r) => setModal({ mode: "edit", data: { ...r } });
  const onDelete = (r) => setConfirmDelete(r);

  const columns = [
    {
      key: "address",
      label: "Address",
      render: (r) => (
        <>
          <div className="font-semibold text-foreground">{r.address}</div>
          <div className="label-mono text-muted-foreground">{r.id}</div>
        </>
      ),
    },
    {
      key: "size",
      label: "Size (ha)",
      render: (r) => `${r.size} ha`,
    },
    {
      key: "yieldKg",
      label: "Yielded Coffee (kg)",
      render: (r) => `${r.yieldKg.toLocaleString()} kg`,
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
      render: (r) =>
        isViewOnly ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <div className="flex items-center justify-end gap-1">
            {!r.isExisting && (
              <IconButton
                icon={Pencil}
                label="Edit"
                onClick={() => onEdit(r)}
              />
            )}
            <IconButton
              icon={Trash2}
              label="Delete"
              tone="danger"
              onClick={() => onDelete(r)}
            />
          </div>
        ),
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
        {!isViewOnly && (
          <Button
            onClick={() =>
              !isManager ? setAddChooserOpen(true) : openAddNew()
            }
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Add Farm
          </Button>
        )}
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        searchKeys={["address", "id"]}
        searchPlaceholder="Search by address or ID…"
        filters={filters}
        pageSize={5}
        getRowKey={(r) => r.id}
        minWidth="720px"
        emptyTitle="No farms found"
        emptyDescription="Try adjusting your search or add a new farm."
      />

      {modal && !isViewOnly && (
        <FarmModal
          mode={modal.mode}
          initial={modal.data}
          isManager={isManager}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {addChooserOpen && !isViewOnly && (
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

      {existingOpen && !isViewOnly && (
        <ExistingFarmModal
          options={EXISTING_FARM_REGISTRY.filter(
            (reg) => !rows.some((r) => r.address === reg.address),
          )}
          onClose={() => setExistingOpen(false)}
          onSelect={attachExisting}
        />
      )}

      {confirmDelete && !isViewOnly && (
        <DeleteConfirmModal
          title="Delete farm?"
          description={
            <>
              Are you sure you want to delete{" "}
              <strong className="text-foreground">
                {confirmDelete.id} ({confirmDelete.address})
              </strong>
              ? This action cannot be undone.
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
