import { forwardRef } from "react";

const btnVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  outline:
    "border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
};

const btnSizes = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-9 px-3 text-sm",
  lg: "h-11 px-6 text-base",
  icon: "h-10 w-10",
};

export const Button = forwardRef(function Btn(
  {
    className,
    variant = "default",
    size = "default",
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={[
        "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        btnVariants[variant] ?? btnVariants.default,
        btnSizes[size] ?? btnSizes.default,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
});
