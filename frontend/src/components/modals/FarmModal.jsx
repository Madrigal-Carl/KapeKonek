import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Button,
  Field,
  IconButton,
  MultiSelect,
  TextInput,
} from "@/components/ui";
import FieldError from "@/components/ui/FieldError";
import { LocationPicker } from "@/components/public";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { useCreateFarm, useUpdateFarm } from "@/hooks/useFarms";
import { useAssociations } from "@/hooks/useAssociations";
import { useUsers } from "@/hooks/useUsers";
import { geocodeAddress } from "@/utils/geocode";
import {
  createFarmSchema,
  createKaluppaFarmSchema,
  getFieldErrors,
  updateFarmSchema,
} from "@/schemas/farm.schema";

export function FarmModal({ mode, initial, onClose }) {
  const { role } = useAuth();
  const isManager = role === ROLES.MANAGER;
  const isKaluppa = role === ROLES.KALUPPA;

  const [form, setForm] = useState(() => ({
    address: initial?.address ?? "",
    size: initial?.size != null ? String(initial.size) : "",
    assignedFarmers: initial?.assignedFarmers?.length
      ? initial.assignedFarmers.map((f) =>
          typeof f === "string" ? f : f._id,
        )
      : [],
    association: initial?.association
      ? typeof initial.association === "string"
        ? initial.association
        : initial.association._id
      : "",
    location:
      initial?.latitude != null && initial?.longitude != null
        ? { lat: Number(initial.latitude), lng: Number(initial.longitude) }
        : null,
  }));
  const [errors, setErrors] = useState({});
  const [geocode, setGeocode] = useState({ kind: "idle", message: "", area: null });

  const createFarm = useCreateFarm();
  const updateFarm = useUpdateFarm();
  const isPending = (mode === "add" ? createFarm : updateFarm).isPending;

  const { data: farmers = [] } = useUsers({ all: true }, { enabled: isManager });
  const { data: associations = [] } = useAssociations({ enabled: isKaluppa });

  const farmerOptions = farmers.map((f) => ({
    value: f._id,
    label: f.fullName,
  }));
  const associationOptions = associations.map((a) => ({
    value: a._id,
    label: a.name,
  }));

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // After the user types the address and leaves the field, locate it on the
  // map: drop the pin at the found coordinates and show a border around the
  // matched area so they can see where the address is.
  const locateAddress = async (event) => {
    const address = String(event?.target?.value ?? "").trim();
    if (!address) {
      setGeocode({ kind: "idle", message: "", area: null });
      return;
    }

    setGeocode({ kind: "searching", message: "Locating address…", area: null });
    try {
      const result = await geocodeAddress(address);
      if (!result) {
        setGeocode({
          kind: "not-found",
          message: `Could not find “${address}” — click the map to set the pin manually.`,
          area: null,
        });
        return;
      }
      set("location", { lat: result.lat, lng: result.lng });
      setGeocode({
        kind: "found",
        message: `Found: ${result.displayName}`,
        area: result.area,
      });
    } catch {
      setGeocode({
        kind: "not-found",
        message:
          "Address search is unavailable right now — click the map to set the pin manually.",
        area: null,
      });
    }
  };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e) => {
    e?.preventDefault();

    const payload = {
      address: form.address.trim(),
      size: form.size,
      latitude: form.location?.lat,
      longitude: form.location?.lng,
      ...(isManager ? { assignedFarmers: form.assignedFarmers } : {}),
      ...(isKaluppa ? { association: form.association || undefined } : {}),
    };

    const schema =
      mode === "add"
        ? isKaluppa
          ? createKaluppaFarmSchema
          : createFarmSchema
        : updateFarmSchema;
    const result = schema.safeParse(payload);

    if (!result.success) {
      setErrors(getFieldErrors(result.error));
      return;
    }

    setErrors({});

    const mutation = mode === "add" ? createFarm : updateFarm;
    const variables =
      mode === "add"
        ? result.data
        : { id: initial._id, data: result.data };

    mutation.mutate(variables, { onSuccess: onClose });
  };

  const locationError = errors.latitude || errors.longitude;

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
            <p className="label-mono mb-1 text-accent">Farm</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {mode === "add"
                ? "Add New Farm"
                : `Edit ${initial.propertyNumber || "Farm"}`}
            </h2>
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-8">
            <SectionGroup title="Property Information">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Address" full>
                  <TextInput
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    onBlur={locateAddress}
                    placeholder="Sitio, Barangay, Municipality"
                  />
                  <FieldError message={errors.address} />
                </Field>
                <Field label="Size (Hectares)" full>
                  <TextInput
                    type="number"
                    min="0"
                    step="any"
                    value={form.size}
                    onChange={(e) => set("size", e.target.value)}
                    placeholder="24"
                  />
                  <FieldError message={errors.size} />
                </Field>

                {isManager && (
                  <Field label="Farmer" full>
                    <MultiSelect
                      values={form.assignedFarmers.slice(0, 1)}
                      onChange={(v) =>
                        set(
                          "assignedFarmers",
                          v.length ? [v[v.length - 1]] : [],
                        )
                      }
                      options={farmerOptions}
                      placeholder="Select a farmer…"
                    />
                    <FieldError message={errors.assignedFarmers} />
                  </Field>
                )}

                {isKaluppa && (
                  <Field label="Association" full>
                    <MultiSelect
                      values={form.association ? [form.association] : []}
                      onChange={(v) =>
                        set("association", v.length ? v[v.length - 1] : "")
                      }
                      options={associationOptions}
                      placeholder="Select association…"
                    />
                    <FieldError message={errors.association} />
                  </Field>
                )}
              </div>
            </SectionGroup>

            <SectionGroup title="Geotag Location">
              <LocationPicker
                value={form.location}
                onChange={(v) => set("location", v)}
                highlight={geocode.area}
                status={geocode}
              />
              <FieldError message={locationError} />
            </SectionGroup>
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
                ? "Add Farm"
                : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionGroup({ title, children }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span className="label-mono shrink-0 text-muted-foreground">
          {title}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      {children}
    </div>
  );
}
