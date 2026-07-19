import { Button } from "@/components/ui";

export function DeleteConfirmModal({ name, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          Delete farmer?
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          This will permanently remove{" "}
          <span className="font-semibold text-foreground">{name}</span>. This
          action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
