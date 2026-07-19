import { useEffect, useState } from "react";
import { ChevronDown, ImagePlus, Star, X } from "lucide-react";
import {
  Button,
  Field,
  IconButton,
  TextInput,
  SingleSelect,
} from "@/components/ui";
import {
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_VARIETY_OPTIONS,
  FARMER_OPTIONS,
} from "@/constants/data";

export function ProductModal({ mode, initial, isManager, onClose, onSave }) {
  const [form, setForm] = useState(initial);
  const [uploads, setUploads] = useState([]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const addImages = (files) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const url = URL.createObjectURL(file);
      setUploads((u) => [...u, { id, name: file.name, progress: 0 }]);
      let progress = 0;
      const tick = () => {
        progress += Math.random() * 18 + 8;
        if (progress >= 100) {
          progress = 100;
          setUploads((u) =>
            u.map((x) => (x.id === id ? { ...x, progress: 100, url } : x)),
          );
          setForm((f) => ({
            ...f,
            images: [...f.images, url],
            primaryImage:
              f.primaryImage ?? (f.images.length === 0 ? url : f.primaryImage),
          }));
          setTimeout(
            () => setUploads((u) => u.filter((x) => x.id !== id)),
            600,
          );
          return;
        }
        setUploads((u) => u.map((x) => (x.id === id ? { ...x, progress } : x)));
        setTimeout(tick, 180 + Math.random() * 160);
      };
      setTimeout(tick, 200);
    });
  };

  const removeImage = (url) =>
    setForm((f) => ({
      ...f,
      images: f.images.filter((u) => u !== url),
      primaryImage:
        f.primaryImage === url
          ? f.images.filter((u) => u !== url)[0]
          : f.primaryImage,
    }));

  const setPrimary = (url) => set("primaryImage", url);

  const submit = (e) => {
    e?.preventDefault();
    if (!form.name.trim()) return;
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
            <p className="label-mono mb-1 text-accent">Product</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {mode === "add" ? "Add New Product" : `Edit ${initial.name}`}
            </h2>
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Product Name" full>
              <TextInput
                value={form.name}
                onChange={(v) => set("name", v)}
                placeholder="e.g. Arabica Green Beans"
              />
            </Field>

            <Field label="Category">
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="w-full appearance-none border border-border bg-background px-3 py-2.5 pr-9 text-sm text-foreground outline-none focus:border-foreground"
                >
                  {PRODUCT_CATEGORY_OPTIONS.map((c) => (
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
                  className="w-full appearance-none border border-border bg-background px-3 py-2.5 pr-9 text-sm text-foreground outline-none focus:border-foreground"
                >
                  {PRODUCT_VARIETY_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </Field>

            <Field label="Status">
              <div className="relative">
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  className="w-full appearance-none border border-border bg-background px-3 py-2.5 pr-9 text-sm text-foreground outline-none focus:border-foreground"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </Field>

            <Field label="Stock">
              <TextInput
                type="number"
                value={String(form.stock)}
                onChange={(v) => set("stock", Number(v))}
                placeholder="0"
              />
            </Field>

            <Field label="Weight (kg) (Optional)">
              <TextInput
                type="number"
                value={String(form.weightKg)}
                onChange={(v) => set("weightKg", Number(v))}
                placeholder="0"
              />
            </Field>

            <Field label="Price">
              <TextInput
                type="number"
                value={String(form.price ?? 0)}
                onChange={(v) => set("price", Number(v))}
                placeholder="0"
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

            <Field label="Description" full>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Short product description…"
                rows={4}
                className="w-full resize-none border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground"
              />
            </Field>

            <Field label="Images" full>
              <label
                htmlFor="product-images-upload"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors hover:border-foreground-40 hover:bg-muted/50"
              >
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
                <div className="text-sm font-medium text-foreground">
                  Click to upload images
                </div>
                <div className="text-xs text-muted-foreground">
                  PNG, JPG up to 5MB each
                </div>
              </label>
              <input
                id="product-images-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  addImages(e.target.files);
                  e.currentTarget.value = "";
                }}
              />
              {uploads.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploads.map((u) => (
                    <div
                      key={u.id}
                      className="border border-border bg-muted/30 px-3 py-2"
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                        <span className="truncate font-medium text-foreground">
                          {u.name}
                        </span>
                        <span className="label-mono text-muted-foreground">
                          {Math.round(u.progress)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden bg-border">
                        <div
                          className={[
                            "h-full transition-all",
                            u.progress >= 100 ? "bg-accent" : "bg-accent/60",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          style={{ width: `${u.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {form.images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {form.images.map((src) => {
                    const isPrimary = form.primaryImage === src;
                    return (
                      <div
                        key={src}
                        className={[
                          "group relative aspect-square overflow-hidden border",
                          isPrimary
                            ? "border-accent ring-2 ring-accent/40"
                            : "border-border",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <img
                          src={src}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        {isPrimary && (
                          <span className="absolute left-1 top-1 inline-flex items-center gap-1 bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
                            <Star className="h-3 w-3 fill-current" /> Primary
                          </span>
                        )}
                        <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => setPrimary(src)}
                              className="grid h-6 w-6 place-items-center bg-background/90 text-foreground hover:bg-accent hover:text-accent-foreground"
                              aria-label="Set as primary"
                              title="Set as primary"
                            >
                              <Star className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(src)}
                            className="grid h-6 w-6 place-items-center bg-background/90 text-foreground hover:bg-destructive hover:text-destructive-foreground"
                            aria-label="Remove image"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Field>
          </div>
        </form>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => submit()}>
            {mode === "add" ? "Add Product" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
