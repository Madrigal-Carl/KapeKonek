import { useEffect, useRef, useState } from "react";
import { ChevronDown, ImagePlus, Star, X } from "lucide-react";
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
import { useUsers } from "@/hooks/useUsers";
import {
  useCoffeeBeans,
  useCreateCoffeeBean,
  useUpdateCoffeeBean,
} from "@/hooks/useCoffeeBeans";
import {
  COFFEE_BEAN_STATUS_OPTIONS,
  COFFEE_BEAN_VARIETY_OPTIONS,
  createCoffeeBeanSchema,
  getFieldErrors,
  updateCoffeeBeanSchema,
} from "@/schemas/coffeeBean.schema";
import { uploadToCloudinary } from "@/services/upload.service";
import { notify, notifyError } from "@/utils/notify";

const UNAPPROVED_LIMIT_KG = 5;

const capitalize = (value) =>
  value
    ? value
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "";

export function CoffeeBeanModal({ mode, initial, onClose }) {
  const { user, role } = useAuth();
  const isManager = role === ROLES.MANAGER;

  const beanLabel = (item) =>
    item?.variety ? `${capitalize(item.variety)} Beans` : "Coffee Beans";

  const [form, setForm] = useState(() => ({
    owner: initial?.owner?._id ?? initial?.owner ?? "",
    variety: initial?.variety ?? "",
    weight: initial?.weight != null ? String(initial.weight) : "",
    status: initial?.status ?? "active",
    description: initial?.description ?? "",
    imageUrls: (initial?.imageUrls ?? []).map((image) =>
      typeof image === "string"
        ? { url: image, isPrimary: false }
        : {
            url: image.url,
            isPrimary: Boolean(image.isPrimary),
          },
    ),
  }));
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState({ active: false, percent: 0 });
  const fileInputRef = useRef(null);

  const createCoffeeBean = useCreateCoffeeBean();
  const updateCoffeeBean = useUpdateCoffeeBean();
  const isPending = (mode === "add" ? createCoffeeBean : updateCoffeeBean)
    .isPending;

  const { data: allBeans = [] } = useCoffeeBeans({ all: true });

  const { data: farmers = [] } = useUsers(
    { role: "farmer", all: true },
    { enabled: isManager },
  );

  const farmerOptions = farmers.map((farmer) => ({
    value: farmer._id,
    label: farmer.fullName || `${farmer.firstName} ${farmer.lastName}`,
    accountStatus: farmer.accountStatus,
  }));

  // Determine if the effective farmer account is unapproved
  const targetOwnerId = isManager ? form.owner : user?._id;
  const isUnapprovedFarmer = isManager
    ? farmers.find((f) => f._id === form.owner)?.accountStatus !== "approved"
    : user?.role === "farmer" && user?.accountStatus !== "approved";

  // Calculate cumulative weight of other active coffee beans listed by this farmer
  const otherBeansWeight = allBeans
    .filter((b) => {
      const bOwnerId = b.owner?._id ?? b.owner;
      return String(bOwnerId) === String(targetOwnerId) && b._id !== initial?._id;
    })
    .reduce((sum, b) => sum + (Number(b.weight) || 0), 0);

  const remainingLimit = Math.max(0, UNAPPROVED_LIMIT_KG - otherBeansWeight);

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

    // Only JPG / JPEG / PNG are accepted for bean images.
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
        const result = await uploadToCloudinary(file, "bean", (loaded) => {
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
      const remaining = current.imageUrls.filter((image) => image.url !== url);
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
      variety: form.variety,
      weight: form.weight === "" ? undefined : form.weight,
      status: form.status,
      description: form.description.trim() || undefined,
      imageUrls: form.imageUrls.length ? form.imageUrls : undefined,
      ...(isManager ? { owner: form.owner || undefined } : {}),
    };

    const schema =
      mode === "add" ? createCoffeeBeanSchema : updateCoffeeBeanSchema;
    const result = schema.safeParse(payload);

    if (!result.success) {
      setErrors(getFieldErrors(result.error));
      return;
    }

    if (isUnapprovedFarmer && Number(result.data.weight) > remainingLimit) {
      setErrors({
        weight: `Weight cannot exceed your remaining unapproved allowance of ${remainingLimit.toFixed(2)} kg (Total limit: 5kg).`,
      });
      return;
    }

    setErrors({});

    const mutation = mode === "add" ? createCoffeeBean : updateCoffeeBean;
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
            <p className="label-mono mb-1 text-accent">Marketplace</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {mode === "view"
                ? `View ${beanLabel(initial)}`
                : mode === "add"
                  ? "Add Coffee Beans"
                  : `Edit ${beanLabel(initial)}`}
            </h2>
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5">
          <fieldset
            disabled={readOnly}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {/* Show Owner field for manager when adding/editing, or in view mode */}
            {isManager && !readOnly && (
              <Field label="Farmer" full>
                <MultiSelect
                  values={form.owner ? [form.owner] : []}
                  onChange={(v) =>
                    set("owner", v.length ? v[v.length - 1] : "")
                  }
                  options={farmerOptions}
                  placeholder="Select a farmer…"
                  searchPlaceholder="Search farmers…"
                />
                <FieldError message={errors.owner} />
              </Field>
            )}

            {readOnly && (
              <Field label="Farmer" full>
                <div className="flex w-full items-center border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground">
                  {initial?.owner?.fullName ?? "—"}
                </div>
              </Field>
            )}

            <Field label="Variety" full>
              <div className="relative">
                <select
                  value={form.variety}
                  onChange={(e) => set("variety", e.target.value)}
                  className="w-full appearance-none border border-border bg-background px-3 py-2.5 pr-9 text-sm text-foreground outline-none focus:border-foreground"
                >
                  <option value="" disabled>
                    Select variety…
                  </option>
                  {COFFEE_BEAN_VARIETY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <FieldError message={errors.variety} />
            </Field>

            <Field label="Weight (kg)">
              <TextInput
                type="number"
                min="0"
                step="any"
                value={form.weight}
                onChange={(e) => set("weight", e.target.value)}
                placeholder="0"
              />
              {isUnapprovedFarmer && !readOnly && (
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                  ⚠️ Unapproved account limit: Max 5kg total (Remaining: {remainingLimit.toFixed(2)} kg).
                </p>
              )}
              <FieldError message={errors.weight} />
            </Field>

            {readOnly && (
              <Field label="Price">
                <div className="flex w-full items-center border border-border bg-muted/40 px-3 py-2.5 text-sm font-semibold text-foreground">
                  {initial?.price != null
                    ? `PHP ${initial.price.toFixed(2)}`
                    : "Not set"}
                </div>
              </Field>
            )}

            <Field label="Status">
              <div className="relative">
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  className="w-full appearance-none border border-border bg-background px-3 py-2.5 pr-9 text-sm text-foreground outline-none focus:border-foreground"
                >
                  {COFFEE_BEAN_STATUS_OPTIONS.map((option) => (
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
                placeholder="Short description of the coffee beans…"
                rows={4}
                className="w-full resize-none border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground"
              />
              <FieldError message={errors.description} />
            </Field>

            <Field label="Images" full>
              {!readOnly && (
                <label
                  htmlFor="coffee-bean-images-upload"
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
                id="coffee-bean-images-upload"
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
                    ? "Add Beans"
                    : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
