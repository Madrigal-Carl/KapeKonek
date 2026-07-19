import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Button, IconButton } from "@/components/ui";

export function ExistingFarmModal({ options, onClose, onSelect }) {
  const [selected, setSelected] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, []);

  const filtered = useMemo(
    () =>
      options.filter(
        (o) =>
          o.address.toLowerCase().includes(q.toLowerCase()) ||
          o.id.toLowerCase().includes(q.toLowerCase()),
      ),
    [q, options],
  );

  const selectedRow = options.find((o) => o.id === selected);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="label-mono mb-1 text-accent">Farm</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Add Existing Farm
            </h2>
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <div className="px-6 py-5">
          <label className="label-mono mb-1.5 block text-muted-foreground">
            Farm
          </label>
          <div ref={ref} className="relative w-full">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-2 border border-border bg-background px-3 py-2.5 text-left text-sm hover:border-foreground/30"
            >
              <span
                className={["truncate", !selectedRow && "text-muted-foreground"]
                  .filter(Boolean)
                  .join(" ")}
              >
                {selectedRow
                  ? `${selectedRow.id} · ${selectedRow.address}`
                  : "Select a farm…"}
              </span>
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
                    placeholder="Search by address or ID…"
                    className="w-full bg-card py-2.5 pl-9 pr-3 text-sm outline-none"
                  />
                </div>
                <ul className="max-h-64 overflow-auto">
                  {filtered.length === 0 ? (
                    <li className="px-3 py-3 text-sm text-muted-foreground">
                      No farms available.
                    </li>
                  ) : (
                    filtered.map((o) => (
                      <li key={o.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(o.id);
                            setOpen(false);
                            setQ("");
                          }}
                          className={[
                            "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted",
                            selected === o.id && "bg-accent/10",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          <span className="font-semibold text-foreground">
                            {o.address}
                          </span>
                          <span className="label-mono text-muted-foreground">
                            {o.id} · {o.size} ha
                          </span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selected}
            onClick={() => selected && onSelect(selected)}
          >
            Add Farm
          </Button>
        </div>
      </div>
    </div>
  );
}
