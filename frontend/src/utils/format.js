export function fmtCoord(n, pos, neg) {
    const dir = n >= 0 ? pos : neg;
    return `${Math.abs(n).toFixed(4)}° ${dir}`;
}

export function fmtDate(s) {
    if (!s) return "";
    const d = typeof s === "string" || typeof s === "number" ? new Date(s) : s;
    if (Number.isNaN(d.getTime())) return String(s);
    return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}
