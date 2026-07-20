import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { IconButton, Button } from "@/components/ui";
import { fmtDate } from "@/utils/format";
import { DataTable } from "@/components/dashboard";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { HARVESTS, HARVEST_CATEGORY_OPTIONS } from "@/constants/data";
import { HarvestModal, DeleteConfirmModal } from "@/components/modals";

export function HarvestPage() {
  const { role } = useAuth();
  const isManager = role === ROLES.MANAGER || role === ROLES.KALUPPA;
  const isViewOnly = role === ROLES.DTI;

  const [rows, setRows] = useState(HARVESTS);
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const nextId = () => `HV-${String(rows.length + 1).padStart(3, "0")}`;

  const openAdd = () =>
    setModal({
      mode: "add",
      data: {
        id: nextId(),
        category: HARVEST_CATEGORY_OPTIONS[0],
        variety: "Arabica",
        yieldKg: 0,
        farm: "",
        farmer: "",
        harvestedAt: new Date().toISOString().slice(0, 10),
      },
    });

  const handleSave = (data) => {
    setRows((r) => {
      const cleaned = { ...data, yieldKg: Number(data.yieldKg) || 0 };
      const exists = r.find((x) => x.id === data.id);
      if (exists) return r.map((x) => (x.id === data.id ? cleaned : x));
      return [...r, cleaned];
    });
    setModal(null);
  };

  const columns = [
    {
      key: "farm",
      label: "Farm",
      render: (row) => (
        <div className="font-semibold text-foreground">{row.farm}</div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (row) => <span className="text-foreground">{row.category}</span>,
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
              onClick={() => setModal({ mode: "edit", data: { ...row } })}
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

  const filters = [
    {
      key: "category",
      initialValue: "all",
      options: [
        { value: "all", label: "All Categories" },
        ...HARVEST_CATEGORY_OPTIONS.map((value) => ({ value, label: value })),
      ],
      matcher: (row, value) => row.category === value,
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
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" /> Add Harvest
          </Button>
        )}
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        searchKeys={[
          (row, query) => (row.farm || "").toLowerCase().includes(query),
        ]}
        searchPlaceholder="Search by farm…"
        filters={filters}
        emptyTitle="No harvests found"
        emptyDescription="Try adjusting your search or add a new harvest."
        minWidth="820px"
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
        <DeleteConfirmModal
          title="Delete harvest?"
          description={
            <>
              This will permanently remove{" "}
              <span className="font-semibold text-foreground">
                {confirmDelete.id}
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
