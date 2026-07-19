import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import {
  Button,
  Field,
  IconButton,
  TextInput,
  SingleSelect,
} from "@/components/ui";
import {
  HARVEST_CATEGORY_OPTIONS,
  HARVEST_VARIETY_OPTIONS,
  HARVEST_FARM_OPTIONS,
  FARMER_OPTIONS,
} from "@/constants/data";

export function HarvestModal({ mode, initial, isManager, onClose, onSave }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e) => {
    e?.preventDefault();
    if (!form.name || !form.farm) return;
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
            <p className="label-mono mb-1 text-accent">Harvest</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {mode === "add" ? "Add New Harvest" : `Edit ${initial.name}`}
            </h2>
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name" full>
              <TextInput
                value={form.name}
                onChange={(v) => set("name", v)}
                placeholder="e.g. Spring Arabica Lot A"
              />
            </Field>

            <Field label="Category">
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="w-full appearance-none border border-border bg-background py-2.5 pl-3 pr-9 text-sm text-foreground outline-none focus:border-foreground"
                >
                  {HARVEST_CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </Field>

            <Field label="Variety">
              <div className="relative">
                <select
                  value={form.variety}
                  onChange={(e) => set("variety", e.target.value)}
                  className="w-full appearance-none border border-border bg-background py-2.5 pl-3 pr-9 text-sm text-foreground outline-none focus:border-foreground"
                >
                  {HARVEST_VARIETY_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </Field>

            <Field label="Yielded (kg)" full>
              <TextInput
                type="number"
                value={String(form.yieldKg)}
                onChange={(v) => set("yieldKg", Number(v))}
                placeholder="0"
              />
            </Field>

            <Field label="Farm" full>
              <SingleSelect
                value={form.farm}
                onChange={(v) => set("farm", v)}
                options={HARVEST_FARM_OPTIONS}
                placeholder="Select a farm…"
                searchPlaceholder="Search farms…"
              />
            </Field>

            {isManager && (
              <Field label="Farmer" full>
                <SingleSelect
                  value={form.farmer}
                  onChange={(v) => set("farmer", v)}
                  options={FARMER_OPTIONS}
                  placeholder="Select a farmer…"
                  searchPlaceholder="Search farmers…"
                />
              </Field>
            )}
          </div>
        </form>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => submit()}>
            {mode === "add" ? "Add Harvest" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
