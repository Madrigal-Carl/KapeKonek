import { forwardRef } from "react";

export const TextInput = forwardRef(function TextInput(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={[
        "h-10 w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
});
