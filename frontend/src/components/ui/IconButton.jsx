export function IconButton({
  icon: Icon,
  label,
  tone = "default",
  className,
  ...props
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={[
        "inline-flex h-9 w-9 items-center justify-center border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-white",
        tone === "danger" && "text-destructive hover:bg-destructive",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
    </button>
  );
}
