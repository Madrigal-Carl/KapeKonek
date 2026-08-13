import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import {
  Button,
  Field,
  IconButton,
  MultiSelect,
  TextInput,
} from "@/components/ui";
import FieldError from "@/components/ui/FieldError";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { useFarms, useFarmFarmers } from "@/hooks/useFarms";
import { useCreateHarvest, useUpdateHarvest } from "@/hooks/useHarvests";
import {
  HARVEST_VARIETY_OPTIONS,
  createHarvestSchema,
  getFieldErrors,
  updateHarvestSchema,
} from "@/schemas/harvest.schema";
export function HarvestModal({ mode, initial, onClose }) {
  const { role } = useAuth();
  const isFarmer = role === ROLES.FARMER;
  const isManagerKaluppa =
    role === ROLES.MANAGER || role === ROLES.KALUPPA;

  const now = new Date();
  const todayMax = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const [form, setForm] = useState(() => ({
    farm: initial?.farm?._id ?? initial?.farm ?? "",
    variety: initial?.variety ?? "",
    yieldKg: initial?.yieldKg != null ? String(initial.yieldKg) : "",
    harvestedAt: initial?.harvestedAt
      ? String(initial.harvestedAt).slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    farmer: initial?.farmer?._id ?? initial?.farmer ?? "",
  }));
  const [errors, setErrors] = useState({});

  const createHarvest = useCreateHarvest();
  const updateHarvest = useUpdateHarvest();
  const isPending = (mode === "add" ? createHarvest : updateHarvest).isPending;

  const { data: farms = [] } = useFarms({ all: true });
  const { data: farmFarmers = [], isLoading: farmersLoading } = useFarmFarmers(
    form.farm,
    { enabled: isManagerKaluppa && Boolean(form.farm) },
  );

  const farmOptions = farms.map((f) => ({
    value: f._id,
    label: `${f.propertyNumber} · ${f.address}`,
  }));
  const farmerOptions = farmFarmers.map((f) => ({
    value: f._id,
    label: f.fullName,
  }));

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e) => {
    e?.preventDefault();

    const payload = {
      farm: form.farm,
      variety: form.variety,
      yieldKg: form.yieldKg,
      harvestedAt: form.harvestedAt || undefined,
      ...(isManagerKaluppa ? { farmer: form.farmer || undefined } : {}),
    };

    const schema = mode === "add" ? createHarvestSchema : updateHarvestSchema;
    const result = schema.safeParse(payload);

    if (!result.success) {
      setErrors(getFieldErrors(result.error));
      return;
    }

    setErrors({});

    const mutation = mode === "add" ? createHarvest : updateHarvest;
    const variables =
      mode === "add" ? result.data : { id: initial._id, data: result.data };

    mutation.mutate(variables, { onSuccess: onClose });
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
            <p className="label-mono mb-1 text-accent">Harvest</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {mode === "add"
                ? "Add New Harvest"
                : `Edit ${initial?.farm?.propertyNumber ?? "Harvest"}`}
            </h2>
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Variety" full>
              <div className="relative">
                <select
                  value={form.variety}
                  onChange={(e) => set("variety", e.target.value)}
                  className="w-full appearance-none border border-border bg-background py-2.5 pl-3 pr-9 text-sm text-foreground outline-none focus:border-foreground"
                >
                  <option value="" disabled>
                    Select variety…
                  </option>
                  {HARVEST_VARIETY_OPTIONS.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <FieldError message={errors.variety} />
            </Field>

            <Field label="Yielded (kg)">
              <TextInput
                type="number"
                min="0"
                step="any"
                value={form.yieldKg}
                onChange={(e) => set("yieldKg", e.target.value)}
                placeholder="0"
              />
              <FieldError message={errors.yieldKg} />
            </Field>

            <Field label="Harvested At">
              <input
                type="date"
                value={form.harvestedAt}
                max={todayMax}
                onChange={(e) => set("harvestedAt", e.target.value)}
                className="w-full border border-border bg-background py-2.5 pl-3 pr-3 text-sm text-foreground outline-none focus:border-foreground"
              />
              <FieldError message={errors.harvestedAt} />
            </Field>

            <Field label="Farm" full>
              <MultiSelect
                values={form.farm ? [form.farm] : []}
                onChange={(v) => {
                  set("farm", v[0] ?? "");
                  set("farmer", "");
                }}
                options={farmOptions}
                placeholder="Select a farm…"
                searchPlaceholder="Search farms…"
              />
              <FieldError message={errors.farm} />
            </Field>

            {isManagerKaluppa && (
              <Field label="Farmer" full>
                <MultiSelect
                  values={form.farmer ? [form.farmer] : []}
                  onChange={(v) => set("farmer", v[0] ?? "")}
                  options={farmerOptions}
                  placeholder={
                    !form.farm
                      ? "Select a farm first…"
                      : farmersLoading
                        ? "Loading farmers…"
                        : "Select a farmer…"
                  }
                  searchPlaceholder="Search farmers…"
                />
                <FieldError message={errors.farmer} />
              </Field>
            )}
          </div>
        </form>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={isPending}>
            {isPending
              ? "Saving…"
              : mode === "add"
                ? "Add Harvest"
                : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
