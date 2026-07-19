import { CheckCircle2, X } from "lucide-react";
import { useToastStore } from "@/stores/toast.store";

export function Toast() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 border border-[var(--color-foreground)] bg-[var(--color-background)] p-4 shadow-[0_8px_0_-4px_var(--color-foreground)] transition-all duration-250 ${
            t.leaving
              ? "translate-x-4 opacity-0"
              : "translate-x-0 opacity-100 animate-[toast-in_0.25s_ease-out]"
          }`}
        >
          <CheckCircle2
            size={18}
            className="mt-0.5 flex-shrink-0 text-[var(--color-accent)]"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--color-foreground)]">
              {t.message}
            </p>
            {t.actionLabel && (
              <button
                type="button"
                onClick={() => {
                  t.onAction?.();
                  dismiss(t.id);
                }}
                className="label-mono mt-2 text-[var(--color-accent)] hover:underline"
              >
                {t.actionLabel}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss"
            className="flex-shrink-0 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          >
            <X size={16} />
          </button>
        </div>
      ))}

      <style>{`
        @keyframes toast-in {
          from { transform: translateX(16px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
