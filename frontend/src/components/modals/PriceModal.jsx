import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button, Field, IconButton, TextInput } from "@/components/ui";
import { useUpdateProductPrice } from "@/hooks/useProducts";

const capitalize = (value) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export function PriceModal({ product, onClose }) {
  const [price, setPrice] = useState(product.price ?? "");
  const updatePrice = useUpdateProductPrice();
  const isPending = updatePrice.isPending;

  const decimalPlaces = (value) => String(value).split(".")[1]?.length ?? 0;
  const invalid =
    price !== "" &&
    (Number(price) < 0 ||
      Number.isNaN(Number(price)) ||
      decimalPlaces(price) > 2);

  // Limit typed values to at most 2 decimal places.
  const handleChange = (e) => {
    const value = e.target.value;
    if (decimalPlaces(value) <= 2) {
      setPrice(value);
      return;
    }
    setPrice(value.replace(/(\.\d{2})\d+$/, "$1"));
  };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e) => {
    e?.preventDefault();
    if (invalid) return;
    updatePrice.mutate(
      { id: product._id, price: Math.round(Number(price) * 100) / 100 || 0 },
      { onSuccess: onClose },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="label-mono mb-1 text-accent">Product</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Set Price
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {[product.category, product.variety]
                .filter(Boolean)
                .map((value) => capitalize(value))
                .join(" · ") || "Product"}{" "}
              <span className="label-mono">
                ({product.farm?.propertyNumber ?? product._id})
              </span>
            </p>
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <form onSubmit={submit} className="px-6 py-5">
          <Field label="Price (PHP)" full>
            <TextInput
              type="number"
              min="0"
              step="0.01"
              value={String(price)}
              onChange={handleChange}
              placeholder="0.00"
              aria-invalid={invalid}
            />
            {invalid && (
              <p className="mt-1.5 text-xs text-destructive">
                Price must be 0 or more, with at most 2 decimal places.
              </p>
            )}
          </Field>
        </form>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={isPending || invalid}
          >
            {isPending ? "Saving…" : "Save Price"}
          </Button>
        </div>
      </div>
    </div>
  );
}
