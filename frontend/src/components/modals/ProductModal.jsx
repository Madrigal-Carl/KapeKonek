import { useEffect, useRef, useState } from "react";
import { ChevronDown, ImagePlus, Star, X } from "lucide-react";
import {
  Button,
  Field,
  IconButton,
  TextInput,
} from "@/components/ui";
import FieldError from "@/components/ui/FieldError";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import {
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_VARIETY_OPTIONS,
  createProductSchema,
  getFieldErrors,
  updateProductSchema,
} from "@/schemas/product.schema";
import { uploadToCloudinary } from "@/services/upload.service";
import { notify, notifyError } from "@/utils/notify";

const capitalize = (value) =>
  value
    ? value
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "";

export function ProductModal({ mode, initial, onClose }) {
  const productLabel = (item) =>
    [item?.category, item?.variety]
      .filter(Boolean)
      .map((value) => capitalize(value))
      .join(" · ") || "Product";

  const [form, setForm] = useState(() => ({
    category: initial?.category ?? "",
    variety: initial?.variety ?? "",
    stock: initial?.stock != null ? String(initial.stock) : "",
    price: initial?.price != null ? String(initial.price) : "",
    status: initial?.status ?? "active",
    description: initial?.description ?? "",
    imageUrls: (initial?.imageUrls ?? []).map((image) => ({
      url: image.url,
      isPrimary: Boolean(image.isPrimary),
    })),
  }));
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState({ active: false, percent: 0 });
  const fileInputRef = useRef(null);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isPending = (mode === "add" ? createProduct : updateProduct).isPending;

  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const readOnly = mode === "view";

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onPickImages = async (e) => {
    const list = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!list.length) return;

    // Only JPG / JPEG / PNG are accepted for product images.
    const ALLOWED_TYPES = ["image/jpeg", "image/png"];
    const valid = list.filter((file) => ALLOWED_TYPES.includes(file.type));
    const skipped = list.length - valid.length;

    if (skipped > 0) {
      notify(
        `${skipped} file${skipped === 1 ? "" : "s"} skipped — only JPG, JPEG, or PNG images are allowed.`,
        { type: "error" },
      );
    }

    if (!valid.length) return;

    const totalBytes = valid.reduce((sum, file) => sum + file.size, 0);
    let completedBytes = 0;
    setUploading({ active: true, percent: 0 });

    for (const file of valid) {
      try {
        const result = await uploadToCloudinary(file, "product", (loaded) => {
          const overall = ((completedBytes + loaded) / totalBytes) * 100;
          setUploading({
            active: true,
            percent: Math.min(Math.round(overall), 99),
          });
        });
        completedBytes += file.size;
        setUploading({
          active: true,
          percent: Math.round((completedBytes / totalBytes) * 100),
        });
        setForm((current) => ({
          ...current,
          imageUrls: [
            ...current.imageUrls,
            {
              url: result.secure_url,
              isPrimary: current.imageUrls.length === 0,
            },
          ],
        }));
      } catch (err) {
        notifyError(err, "Failed to upload image");
      }
    }

    setUploading({ active: false, percent: 100 });
  };

  const removeImage = (url) =>
    setForm((current) => {
      const remaining = current.imageUrls.filter(
        (image) => image.url !== url,
      );
      const hasPrimary = remaining.some((image) => image.isPrimary);
      return {
        ...current,
        imageUrls: remaining.map((image, index) => ({
          ...image,
          isPrimary: hasPrimary ? image.isPrimary : index === 0,
        })),
      };
    });

  const setPrimary = (url) =>
    setForm((current) => ({
      ...current,
      imageUrls: current.imageUrls.map((image) => ({
        ...image,
        isPrimary: image.url === url,
      })),
    }));

  const submit = (e) => {
    e?.preventDefault();

    const payload = {
      category: form.category,
      variety: form.variety,
      stock: form.stock === "" ? undefined : form.stock,
      price: form.price === "" ? undefined : form.price,
      status: form.status,
      description: form.description.trim() || undefined,
      imageUrls: form.imageUrls.length ? form.imageUrls : undefined,
    };

    const schema = mode === "add" ? createProductSchema : updateProductSchema;
    const result = schema.safeParse(payload);

    if (!result.success) {
      setErrors(getFieldErrors(result.error));
      return;
    }

    setErrors({});

    const mutation = mode === "add" ? createProduct : updateProduct;
    const variables =
      mode === "add"
        ? result.data
        : { id: initial._id, data: result.data };

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
            <p className="label-mono mb-1 text-accent">Product</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {mode === "view"
                ? `View ${productLabel(initial)}`
                : mode === "add"
                  ? "Add New Product"
                  : `Edit ${productLabel(initial)}`}
            </h2>
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5">
          <fieldset disabled={readOnly} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Category">
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="w-full appearance-none border border-border bg-background px-3 py-2.5 pr-9 text-sm text-foreground outline-none focus:border-foreground"
                >
                  <option value="" disabled>
                    Select category…
                  </option>
                  {PRODUCT_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <FieldError message={errors.category} />
            </Field>

            <Field label="Variety">
              <div className="relative">
                <select
                  value={form.variety}
                  onChange={(e) => set("variety", e.target.value)}
                  className="w-full appearance-none border border-border bg-background px-3 py-2.5 pr-9 text-sm text-foreground outline-none focus:border-foreground"
                >
                  <option value="" disabled>
                    Select variety…
                  </option>
                  {PRODUCT_VARIETY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <FieldError message={errors.variety} />
            </Field>

            <Field label="Stock">
              <TextInput
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
                placeholder="0"
              />
              <FieldError message={errors.stock} />
            </Field>

            <Field label="Price (PHP)">
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="0.00"
              />
              <FieldError message={errors.price} />
            </Field>

            <Field label="Status" full>
              <div className="relative">
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  className="w-full appearance-none border border-border bg-background px-3 py-2.5 pr-9 text-sm text-foreground outline-none focus:border-foreground"
                >
                  {PRODUCT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <FieldError message={errors.status} />
            </Field>

            <Field label="Description" full>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Short product description…"
                rows={4}
                className="w-full resize-none border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground"
              />
              <FieldError message={errors.description} />
            </Field>

            <Field label="Images" full>
              {!readOnly && (
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
              )}
              <input
                id="product-images-upload"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                multiple
                disabled={uploading.active}
                className="hidden"
                onChange={onPickImages}
              />

              {uploading.active && (
                <div className="mt-3 flex items-center gap-3 border border-border bg-muted/30 p-3">
                  <div className="h-1.5 flex-1 overflow-hidden bg-muted">
                    <div
                      className="h-full bg-accent transition-[width] duration-150"
                      style={{ width: `${uploading.percent}%` }}
                    />
                  </div>
                  <span className="label-mono shrink-0 text-muted-foreground">
                    {uploading.percent}%
                  </span>
                </div>
              )}

              {form.imageUrls.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {form.imageUrls.map((image) => (
                    <div
                      key={image.url}
                      className={[
                        "group relative aspect-square overflow-hidden border",
                        image.isPrimary
                          ? "border-accent ring-2 ring-accent/40"
                          : "border-border",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <img
                        src={image.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      {image.isPrimary && (
                        <span className="absolute left-1 top-1 inline-flex items-center gap-1 bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
                          <Star className="h-3 w-3 fill-current" /> Primary
                        </span>
                      )}
                      {!readOnly && (
                        <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {!image.isPrimary && (
                            <button
                              type="button"
                              onClick={() => setPrimary(image.url)}
                              className="grid h-6 w-6 place-items-center bg-background/90 text-foreground hover:bg-accent hover:text-accent-foreground"
                              aria-label="Set as primary"
                              title="Set as primary"
                            >
                              <Star className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(image.url)}
                            className="grid h-6 w-6 place-items-center bg-background/90 text-foreground hover:bg-destructive hover:text-destructive-foreground"
                            aria-label="Remove image"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Field>
          </fieldset>
        </form>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
          {readOnly ? (
            <Button type="button" onClick={onClose}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={submit}
                disabled={isPending || uploading.active}
              >
                {isPending
                  ? "Saving…"
                  : mode === "add"
                    ? "Add Product"
                    : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
