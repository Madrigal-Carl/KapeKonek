import { useState } from "react";
import { Archive, Eye, Pencil, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui";
import { fmtPrice } from "@/utils/format";
import {
  DataTable,
  PageSection,
  RowActions,
  StatusPill,
} from "@/components/dashboard";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import {
  useCoffeeBeans,
  useDeleteCoffeeBean,
} from "@/hooks/useCoffeeBeans";
import {
  COFFEE_BEAN_STATUS_OPTIONS,
  COFFEE_BEAN_VARIETY_OPTIONS,
} from "@/schemas/coffeeBean.schema";
import {
  ArchiveConfirmModal,
  BeanPriceModal,
  CoffeeBeanModal,
} from "@/components/modals";

const capitalize = (value) =>
  value
    ? value
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "";

export function BeansPage() {
  const { role } = useAuth();
  const isDTI = role === ROLES.DTI;
  const isFarmerOrManager =
    role === ROLES.FARMER || role === ROLES.MANAGER;

  const { data: coffeeBeans = [], isLoading } = useCoffeeBeans({ all: true });
  const deleteCoffeeBean = useDeleteCoffeeBean();

  const [modal, setModal] = useState(null);
  const [priceModal, setPriceModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const columns = [
    {
      key: "owner",
      label: "Farmer",
      render: (row) => (
        <div>
          <div className="font-semibold text-foreground">
            {row.owner?.fullName ?? "—"}
          </div>
          <div className="label-mono text-muted-foreground">
            {row.owner?._id ?? "—"}
          </div>
        </div>
      ),
    },
    {
      key: "variety",
      label: "Variety",
      render: (row) => (
        <span className="font-medium text-foreground">
          {capitalize(row.variety ?? "")}
        </span>
      ),
    },
    {
      key: "weight",
      label: "Weight",
      render: (row) =>
        row.weight != null ? (
          <span className="text-foreground">
            {row.weight.toLocaleString()} kg
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "price",
      label: "Price",
      render: (row) =>
        row.price != null ? (
          <span className="font-semibold text-foreground">
            {fmtPrice(row.price)}
          </span>
        ) : (
          <span className="text-muted-foreground">Not set</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusPill status={row.status} />,
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
            ...(isDTI
              ? [
                  {
                    key: "price",
                    label: "Set Price",
                    icon: Tag,
                    onClick: () => setPriceModal(row),
                  },
                ]
              : []),
            ...(isFarmerOrManager
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
        ...COFFEE_BEAN_VARIETY_OPTIONS,
      ],
      matcher: (row, value) => row.variety === value,
    },
    {
      key: "status",
      initialValue: "all",
      options: [
        { value: "all", label: "All Status" },
        ...COFFEE_BEAN_STATUS_OPTIONS,
      ],
      matcher: (row, value) => row.status === value,
    },
  ];

  return (
    <div className="py-8">
      <PageSection
        eyebrow="Marketplace"
        title="Beans"
        description="Farmer-submitted coffee beans, stock weights, and pricing."
        action={
          isFarmerOrManager ? (
            <Button
              onClick={() => setModal({ mode: "add", data: null })}
              className="gap-2"
            >
              <Plus className="h-4 w-4" /> Add Beans
            </Button>
          ) : null
        }
      />

      <DataTable
        rows={coffeeBeans}
        columns={columns}
        searchKeys={[
          (row, query) =>
            (row.owner?.fullName ?? "").toLowerCase().includes(query) ||
            (row.variety ?? "").toLowerCase().includes(query) ||
            (row.description ?? "").toLowerCase().includes(query),
        ]}
        searchPlaceholder="Search by farmer, variety, or description…"
        filters={filters}
        getRowKey={(row) => row._id}
        loading={isLoading}
        emptyTitle="No coffee beans found"
        emptyDescription={
          isFarmerOrManager
            ? "Try adjusting your search or add new coffee beans."
            : "Try adjusting your search or filters."
        }
        minWidth="860px"
      />

      {modal && (
        <CoffeeBeanModal
          mode={modal.mode}
          initial={modal.data}
          onClose={() => setModal(null)}
        />
      )}

      {priceModal && isDTI && (
        <BeanPriceModal
          bean={priceModal}
          onClose={() => setPriceModal(null)}
        />
      )}

      {confirmDelete && isFarmerOrManager && (
        <ArchiveConfirmModal
          title="Archive coffee beans?"
          description={
            <>
              You're about to archive{" "}
              <strong className="text-foreground">
                {capitalize(confirmDelete.variety)} Beans
              </strong>
              . It will no longer appear in active lists.
            </>
          }
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            deleteCoffeeBean.mutate(confirmDelete._id, {
              onSuccess: () => setConfirmDelete(null),
            });
          }}
        />
      )}
    </div>
  );
}
