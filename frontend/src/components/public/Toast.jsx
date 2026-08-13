import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useToastStore } from "@/stores/toast.store";

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const ICON_CLASS = {
  success: "text-accent",
  error: "text-destructive",
  info: "text-muted-foreground",
};

const BORDER_CLASS = {
  success: "border-foreground",
  error: "border-destructive",
  info: "border-foreground",
};

export function Toast() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] ?? CheckCircle2;

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 border bg-background p-4 shadow-[0_8px_0_-4px_var(--color-foreground)] transition-all duration-250 ${
              BORDER_CLASS[t.type] ?? "border-foreground"
            } ${t.leaving
              ? "translate-x-4 opacity-0"
              : "translate-x-0 opacity-100 animate-[toast-in_0.25s_ease-out]"
            }`}
          >
            <Icon
              size={18}
              className={`mt-0.5 flex-shrink-0 ${ICON_CLASS[t.type] ?? "text-accent"}`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {t.message}
              </p>
              {t.actionLabel && (
                <button
                  type="button"
                  onClick={() => {
                    t.onAction?.();
                    dismiss(t.id);
                  }}
                  className="label-mono mt-2 text-accent hover:underline"
                >
                  {t.actionLabel}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}

      <style>{`
        @keyframes toast-in {
          from { transform: translateX(16px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
