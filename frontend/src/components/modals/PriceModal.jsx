import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button, Field, IconButton, TextInput } from "@/components/ui";

export function PriceModal({ product, onClose, onSave }) {
  const [price, setPrice] = useState(product.price ?? 0);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e) => {
    e?.preventDefault();
    onSave(Number(price) || 0);
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
              {product.name} <span className="label-mono">({product.id})</span>
            </p>
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <form onSubmit={submit} className="px-6 py-5">
          <Field label="Price" full>
            <TextInput
              type="number"
              value={String(price)}
              onChange={(v) => setPrice(v)}
              placeholder="0"
            />
          </Field>
        </form>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => submit()}>
            Save Price
          </Button>
        </div>
      </div>
    </div>
  );
}
