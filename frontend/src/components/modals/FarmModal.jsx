import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Button,
  Field,
  IconButton,
  TextInput,
  MultiSelect,
} from "@/components/ui";
import { FARMER_OPTIONS, ASSOCIATION_OPTIONS } from "@/constants/data";
import { LocationPicker } from "@/components/public";

export function FarmModal({ mode, initial, isManager, onClose, onSave }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e) => {
    e?.preventDefault();
    if (!form.address) return;
    onSave(form);
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
            <p className="label-mono mb-1 text-accent">Farm</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {mode === "add" ? "Add New Farm" : `Edit ${initial.address}`}
            </h2>
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Size (Hectares)" full>
              <TextInput
                type="number"
                value={String(form.size)}
                onChange={(v) => set("size", Number(v))}
                placeholder="24"
              />
            </Field>
            <Field label="Address" full>
              <TextInput
                value={form.address}
                onChange={(v) => set("address", v)}
                placeholder="Sitio, Barangay, Municipality"
              />
            </Field>

            {isManager && (
              <>
                <Field label="Association" full>
                  <MultiSelect
                    values={form.associations || []}
                    onChange={(v) => set("associations", v)}
                    options={ASSOCIATION_OPTIONS}
                    placeholder="Select association(s)…"
                  />
                </Field>

                <Field label="Farmer(s)" full>
                  <MultiSelect
                    values={form.farmers || []}
                    onChange={(v) => set("farmers", v)}
                    options={FARMER_OPTIONS}
                    placeholder="Select farmer(s)…"
                  />
                </Field>
              </>
            )}

            <Field label="Geotag Location" full>
              <LocationPicker
                value={form.location}
                onChange={(v) => set("location", v)}
              />
            </Field>
          </div>
        </form>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => submit()}>
            {mode === "add" ? "Add Farm" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
