const STATUS_META = {
  pending: {
    label: "Pending",
    tone: "warning",
  },
  reserved: {
    label: "Reserved",
    tone: "info",
  },
  completed: {
    label: "Completed",
    tone: "success",
  },
  cancelled: {
    label: "Cancelled",
    tone: "danger",
  },
  active: {
    label: "Active",
    tone: "success",
  },
  inactive: {
    label: "Inactive",
    tone: "neutral",
  },
  approved: {
    label: "Approved",
    tone: "success",
  },
  denied: {
    label: "Denied",
    tone: "danger",
  },
};

export function StatusPill({ status, children, tone }) {
  const meta = tone
    ? {
        border: "border-border",
        dot: "bg-muted-foreground",
        text: "text-foreground",
        tone,
      }
    : (STATUS_META[status] ?? STATUS_META.inactive);

  const map = {
    success: "border-accent bg-accent/10 text-foreground",
    warning: "border-[#b8860b] bg-[#fff7e6] text-foreground",
    danger: "border-destructive bg-destructive/10 text-foreground",
    neutral: "border-border bg-muted text-foreground",
    info: "border-[#3b82f6] bg-[#e8f1ff] text-foreground",
  };

  const dotMap = {
    success: "bg-accent",
    warning: "bg-[#b8860b]",
    danger: "bg-destructive",
    neutral: "bg-muted-foreground",
    info: "bg-[#3b82f6]",
  };

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 border-l-2 px-2.5 py-1 text-xs font-semibold",
        map[meta.tone] ?? map.neutral,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={["h-1.5 w-1.5", dotMap[meta.tone] ?? dotMap.neutral]
          .filter(Boolean)
          .join(" ")}
      />
      {children ?? meta.label}
    </span>
  );
}
