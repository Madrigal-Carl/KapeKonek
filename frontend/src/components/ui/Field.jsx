export function Field({ label, children, full = false, className }) {
  return (
    <label
      className={["flex flex-col gap-1.5", full && "sm:col-span-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      {label ? (
        <span className="text-sm font-medium text-foreground">{label}</span>
      ) : null}
      {children}
    </label>
  );
}
