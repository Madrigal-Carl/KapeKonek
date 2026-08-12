import { useEffect, useState } from "react";
import { Button } from "@/components/ui";

/**
 * Manager: reviews the farmer's ASSOCIATION application only. This is a
 * lightweight confirmation — no attachments, no account-level details —
 * since the account itself was already handled by DTI.
 */
export function AssociationReviewModal({ row, action, onCancel, onConfirm }) {
  const isApprove = action === "approve";
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const remarksRequired = !isApprove;
  const canConfirm = !remarksRequired || remarks.trim().length > 0;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(remarksRequired ? remarks.trim() : undefined);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="label-mono mb-1 text-accent">
          {isApprove ? "Approve Association" : "Deny Association"}
        </p>
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          {isApprove
            ? "Approve association application?"
            : "Deny association application?"}
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{row.fullName}</span>{" "}
          {isApprove
            ? "will be approved for association with the cooperative."
            : "will be denied association with the cooperative."}
        </p>

        {remarksRequired && (
          <div className="mb-6">
            <label
              htmlFor="association-deny-remarks"
              className="label-mono mb-1.5 block text-muted-foreground"
            >
              Remarks
            </label>
            <textarea
              id="association-deny-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder="Explain why this association application is being denied…"
              className="w-full resize-none border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              This will be shared with the farmer so they know what to fix.
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant={isApprove ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            {isApprove ? "Approve" : "Deny"}
          </Button>
        </div>
      </div>
    </div>
  );
}
