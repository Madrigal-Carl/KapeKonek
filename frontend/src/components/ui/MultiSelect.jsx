import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Plus, Search, X } from "lucide-react";

export function MultiSelect({
  values,
  onChange,
  options,
  placeholder,
  allowCreate = false,
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, []);

  const normalized = useMemo(
    () =>
      options.map((option) =>
        typeof option === "string"
          ? { value: option, label: option }
          : { value: String(option.value), label: option.label },
      ),
    [options],
  );

  const filtered = useMemo(
    () =>
      normalized.filter((option) =>
        option.label.toLowerCase().includes(q.toLowerCase()),
      ),
    [q, normalized],
  );

  const trimmed = q.trim();
  const canCreate =
    allowCreate &&
    trimmed.length > 0 &&
    !normalized.some(
      (option) => option.label.toLowerCase() === trimmed.toLowerCase(),
    );

  const toggle = (option) =>
    onChange(
      values.includes(option.value)
        ? values.filter((v) => v !== option.value)
        : [...values, option.value],
    );

  const handleCreate = () => {
    if (!canCreate) return;
    if (!values.includes(trimmed)) onChange([...values, trimmed]);
    setQ("");
  };

  const labelOf = (value) =>
    normalized.find((option) => option.value === value)?.label ?? value;

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 border border-border bg-background px-3 py-2.5 text-left text-sm hover:border-foreground/30"
      >
        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          {values.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            values.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1 border border-border bg-accent/10 px-2 py-0.5 text-xs font-semibold text-foreground"
              >
                {labelOf(v)}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(values.filter((x) => x !== v));
                  }}
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </span>
              </span>
            ))
          )}
        </div>
        <ChevronDown
          className={[
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 border border-border bg-card shadow-lg">
          <div className="relative border-b border-border">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canCreate) {
                  e.preventDefault();
                  handleCreate();
                }
              }}
              placeholder="Search…"
              className="w-full bg-card py-2.5 pl-9 pr-3 text-sm outline-none"
            />
          </div>
          <ul className="max-h-56 overflow-auto">
            {filtered.length === 0 && !canCreate ? (
              <li className="px-3 py-3 text-sm text-muted-foreground">
                No results.
              </li>
            ) : (
              filtered.map((option) => {
                const selected = values.includes(option.value);
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => toggle(option)}
                      className={[
                        "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted",
                        selected && "bg-accent/10 font-semibold",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {option.label}
                      {selected && <span className="h-1.5 w-1.5 bg-accent" />}
                    </button>
                  </li>
                );
              })
            )}
            {canCreate && (
              <li className="border-t border-border">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-accent hover:bg-muted"
                >
                  <Plus className="h-4 w-4" />
                  Add "{trimmed}"
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
