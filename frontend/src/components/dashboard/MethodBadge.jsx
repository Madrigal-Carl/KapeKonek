export function MethodBadge({ method, type }) {
  if (type === "delivery" || method === "delivery" || method === "pickup") {
    const label = method === "delivery" ? "Delivery" : "Pickup";
    const tone =
      method === "delivery"
        ? "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300"
        : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";

    return (
      <span
        className={[
          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
          tone,
        ].join(" ")}
      >
        {label}
      </span>
    );
  }

  const label = method === "e-wallet" ? "E-Wallet" : "Cash";
  const tone =
    method === "e-wallet"
      ? "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300"
      : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tone,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
