import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { IconButton } from "@/components/ui";

function getValue(record, path) {
  if (!path) return "";
  if (typeof path === "function") return path(record);
  if (Array.isArray(path)) {
    return path.reduce((acc, key) => acc?.[key], record);
  }
  return record?.[path] ?? "";
}

export function DataTable({
  rows = [],
  columns = [],
  searchKeys = [],
  searchPlaceholder = "Search…",
  filters = [],
  pageSize = 5,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search or filters.",
  getRowKey = (row) => row.id,
  minWidth = "640px",
}) {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState(() =>
    Object.fromEntries(
      filters.map((filter) => [filter.key, filter.initialValue ?? "all"]),
    ),
  );
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = rows;

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((row) => {
        if (typeof searchKeys === "function") {
          return searchKeys(row, q);
        }
        return searchKeys.some((key) => {
          if (typeof key === "function") {
            return key(row, q);
          }
          const value = getValue(row, key);
          return String(value ?? "")
            .toLowerCase()
            .includes(q);
        });
      });
    }

    filters.forEach((filter) => {
      const value = filterValues[filter.key] ?? filter.initialValue ?? "all";
      if (value && value !== "all") {
        result = result.filter((row) => {
          if (filter.matcher) return filter.matcher(row, value);
          return String(getValue(row, filter.key) ?? "") === String(value);
        });
      }
    });

    return result;
  }, [rows, query, filterValues, filters, searchKeys]);

  useEffect(() => setPage(1), [query, filterValues]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  return (
    <div className="border border-border bg-card">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        {searchKeys.length > 0 && (
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground"
            />
          </div>
        )}

        {filters.map((filter) => (
          <div
            key={filter.key}
            className="relative w-full min-w-[160px] sm:w-auto"
          >
            <select
              value={filterValues[filter.key] ?? filter.initialValue ?? "all"}
              onChange={(event) =>
                setFilterValues((current) => ({
                  ...current,
                  [filter.key]: event.target.value,
                }))
              }
              className="w-full appearance-none border border-border bg-background py-2.5 pl-3 pr-9 text-sm text-foreground outline-none focus:border-foreground"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        ))}
      </div>

      <div className="relative w-full overflow-auto">
        <table
          className="w-full caption-bottom border-collapse text-sm"
          style={{ minWidth }}
        >
          <thead className="bg-muted/60">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={[
                    "label-mono px-4 py-3 text-left text-muted-foreground",
                    column.className,
                    column.align === "right" && "text-right",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center border border-border bg-muted">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="font-semibold text-foreground">
                    {emptyTitle}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {emptyDescription}
                  </div>
                </td>
              </tr>
            ) : (
              paged.map((row) => (
                <tr
                  key={getRowKey(row)}
                  className="border-t border-border transition-colors hover:bg-muted/40"
                >
                  {columns.map((column) => (
                    <td
                      key={`${getRowKey(row)}-${column.key}`}
                      className={[
                        "px-4 py-3.5",
                        column.cellClassName,
                        column.align === "right" && "text-right",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {column.render
                        ? column.render(row)
                        : getValue(row, column.key)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3 text-sm">
        <div className="text-muted-foreground">
          Showing {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
          {Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
        </div>
        <div className="flex items-center gap-1">
          <IconButton
            icon={ChevronLeft}
            label="Previous"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          />
          <span className="px-3 font-semibold text-foreground">
            {safePage} / {totalPages}
          </span>
          <IconButton
            icon={ChevronRight}
            label="Next"
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
          />
        </div>
      </div>
    </div>
  );
}
