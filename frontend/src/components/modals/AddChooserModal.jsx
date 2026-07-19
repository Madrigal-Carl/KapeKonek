import { useEffect } from "react";
import { Plus, Search, X } from "lucide-react";
import { IconButton } from "@/components/ui";

export function AddChooserModal({ onClose, onNew, onExisting }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="label-mono mb-1 text-accent">Farm</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Add Farm
            </h2>
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>
        <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">
          <button
            type="button"
            onClick={onExisting}
            className="group flex flex-col items-start gap-2 border border-border bg-background p-5 text-left transition-colors hover:border-foreground-40 hover:bg-muted/60"
          >
            <span className="grid h-9 w-9 place-items-center border border-border bg-muted text-accent">
              <Search className="h-4 w-4" />
            </span>
            <span className="font-semibold text-foreground">
              Add Existing Farm
            </span>
            <span className="text-xs text-muted-foreground">
              Pick from the registry of pre-mapped farms in your area.
            </span>
          </button>
          <button
            type="button"
            onClick={onNew}
            className="group flex flex-col items-start gap-2 border border-border bg-background p-5 text-left transition-colors hover:border-foreground-40 hover:bg-muted/60"
          >
            <span className="grid h-9 w-9 place-items-center border border-border bg-muted text-accent">
              <Plus className="h-4 w-4" />
            </span>
            <span className="font-semibold text-foreground">Add New Farm</span>
            <span className="text-xs text-muted-foreground">
              Capture size, address, and geotag a brand-new plot on the map.
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
