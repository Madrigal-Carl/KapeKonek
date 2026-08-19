import { isValidElement } from "react";

export function IconButton({
  icon: Icon,
  label,
  tone = "default",
  className,
  ...props
}) {
  const renderIcon = () => {
    if (!Icon) return null;
    if (isValidElement(Icon)) return Icon;
    if (typeof Icon === "function" || typeof Icon === "object") {
      const Component = Icon;
      return <Component className="h-4 w-4" />;
    }
    return null;
  };

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
      {renderIcon()}
    </button>
  );
}
