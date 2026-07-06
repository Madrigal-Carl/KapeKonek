export function MethodBadge({ method }) {
  const label = method === "e-wallet" ? "E-Wallet" : "Cash";
  const tone =
    method === "e-wallet"
      ? "bg-sky-100 text-sky-700"
      : "bg-amber-100 text-amber-700";

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
