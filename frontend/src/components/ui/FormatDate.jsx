export function FormatDate(s) {
  if (!s) return "";
  const d = typeof s === "string" || typeof s === "number" ? new Date(s) : s;
  if (Number.isNaN(d.getTime())) return String(s);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
