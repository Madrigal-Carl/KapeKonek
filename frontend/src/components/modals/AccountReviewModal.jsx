import { useEffect, useState } from "react";
import { Eye, FileText, Image as ImageIcon, X } from "lucide-react";
import { Button, IconButton } from "@/components/ui";
import { fmtDate } from "@/utils/format";

/**
 * DTI: reviews the farmer's ACCOUNT application. Shows full details and
 * submitted attachments so DTI can verify identity/documents before
 * approving or denying the account itself. Attachments are hosted on
 * Cloudinary, so each one is just a link that opens in a new tab.
 */
export function AccountReviewModal({ row, action, onCancel, onConfirm }) {
  const isApprove = action === "approve";
  const files = row.files ?? [];
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
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="label-mono mb-1 text-accent">
              {isApprove ? "Approve Account" : "Deny Account"}
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Review Farmer Details
            </h2>
          </div>
          <IconButton icon={X} label="Close" onClick={onCancel} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-4 border border-border bg-muted/30 p-4">
            <div>
              <p className="label-mono mb-1 text-muted-foreground">Full Name</p>
              <p className="text-sm font-semibold text-foreground">
                {row.fullName}
              </p>
            </div>
            <div>
              <p className="label-mono mb-1 text-muted-foreground">Email</p>
              <p className="text-sm font-semibold text-foreground">
                {row.email}
              </p>
            </div>
            <div>
              <p className="label-mono mb-1 text-muted-foreground">Farmer ID</p>
              <p className="text-sm font-semibold text-foreground">{row.id}</p>
            </div>
            <div>
              <p className="label-mono mb-1 text-muted-foreground">Applied</p>
              <p className="text-sm font-semibold text-foreground">
                {fmtDate(row.joinedAt)}
              </p>
            </div>
          </div>

          <p className="label-mono mb-2 mt-5 text-muted-foreground">
            Attachments ({files.length})
          </p>
          {files.length === 0 ? (
            <div className="border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
              No attachments submitted
            </div>
          ) : (
            <ul className="space-y-2">
              {files.map((f, i) => {
                const Icon = f.type === "image" ? ImageIcon : FileText;
                return (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between gap-3 border border-border bg-background p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center border border-border bg-muted">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-foreground">
                          {f.name}
                        </div>
                        <div className="label-mono text-muted-foreground">
                          {(f.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                    {f.url ? (
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 shrink-0 items-center gap-1.5 border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </a>
                    ) : (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        No link
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {remarksRequired && (
            <div className="mt-5">
              <label
                htmlFor="deny-remarks"
                className="label-mono mb-1.5 block text-muted-foreground"
              >
                Remarks
              </label>
              <textarea
                id="deny-remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                placeholder="Explain why this account is being denied…"
                className="w-full resize-none border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                This will be shared with the farmer so they know what to fix.
              </p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-border bg-muted/40 px-6 py-4">
          <p className="text-sm text-muted-foreground">
            {isApprove ? (
              <>
                <span className="font-semibold text-foreground">
                  {row.fullName}
                </span>{" "}
                will be marked as approved and granted full access to the
                platform.
              </>
            ) : (
              <>
                <span className="font-semibold text-foreground">
                  {row.fullName}
                </span>{" "}
                will be marked as denied and remain limited to basic platform
                access.
              </>
            )}
          </p>
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
    </div>
  );
}
