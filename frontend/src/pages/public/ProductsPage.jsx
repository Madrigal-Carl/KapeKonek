import { useMemo, useState } from "react";
import { Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { PRODUCTS, CATEGORIES } from "@/constants/products";
import { ProductCard } from "@/components/public";

const SORTS = [
  { v: "latest", l: "Latest" },
  { v: "price-asc", l: "Price: Low to High" },
  { v: "price-desc", l: "Price: High to Low" },
  { v: "best", l: "Best Selling" },
];

const PAGE_SIZE = 8;

export default function ProductsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = [...PRODUCTS];
    const ql = q.trim().toLowerCase();
    if (ql)
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(ql) ||
          p.description.toLowerCase().includes(ql),
      );
    if (cat !== "All") list = list.filter((p) => p.category === cat);
    const mn = Number(min);
    const mx = Number(max);
    if (!Number.isNaN(mn) && min !== "")
      list = list.filter((p) => p.price >= mn);
    if (!Number.isNaN(mx) && max !== "")
      list = list.filter((p) => p.price <= mx);
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "best":
        list.sort((a, b) => b.sellerProductsSold - a.sellerProductsSold);
        break;
      default:
        break;
    }
    return list;
  }, [q, cat, min, max, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <div>
      <section className="border-b border-border bg-[var(--color-surface)]">
        <div className="kk-container py-14">
          <span className="label-mono text-[var(--color-accent)]">
            Marketplace
          </span>
          <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">
            Coffee, direct from farm.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Browse {PRODUCTS.length} products from verified farmers and
            cooperatives.
          </p>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="kk-container grid gap-4 py-6 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:items-end">
          <Field label="Search">
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Search products"
                className="h-11 w-full border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-foreground"
              />
            </div>
          </Field>
          <Field label="Category">
            <SelectWrap>
              <select
                value={cat}
                onChange={(e) => {
                  setCat(e.target.value);
                  setPage(1);
                }}
                className="h-11 w-full appearance-none border border-border bg-background pl-3 pr-9 text-sm outline-none focus:border-foreground"
              >
                <option>All</option>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </SelectWrap>
          </Field>
          <Field label="Price Range">
            <div className="flex gap-2">
              <input
                value={min}
                onChange={(e) => {
                  setMin(e.target.value);
                  setPage(1);
                }}
                placeholder="Min"
                inputMode="numeric"
                className="h-11 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
              />

              <input
                value={max}
                onChange={(e) => {
                  setMax(e.target.value);
                  setPage(1);
                }}
                placeholder="Max"
                inputMode="numeric"
                className="h-11 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
              />
            </div>
          </Field>
          <Field label="Sort By">
            <SelectWrap>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-11 w-full appearance-none border border-border bg-background pl-3 pr-9 text-sm outline-none focus:border-foreground"
              >
                {SORTS.map((s) => (
                  <option key={s.v} value={s.v}>
                    {s.l}
                  </option>
                ))}
              </select>
            </SelectWrap>
          </Field>
        </div>
      </section>

      <section className="bg-[var(--color-surface)]">
        <div className="kk-container py-12">
          <div className="mb-6 flex items-center justify-between">
            <p className="label-mono text-muted-foreground">
              {filtered.length} results
            </p>
          </div>
          {pageItems.length === 0 ? (
            <div className="border border-border bg-background p-16 text-center">
              <p className="text-muted-foreground">
                No products match your filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {pageItems.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav
              className="mt-12 flex items-center justify-center gap-2"
              aria-label="Pagination"
            >
              <PageBtn
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
                aria="Previous"
              >
                <ChevronLeft size={16} />
              </PageBtn>
              {Array.from({ length: totalPages }).map((_, i) => {
                const n = i + 1;
                const active = n === safePage;
                return (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`label-mono h-10 min-w-10 px-3 border ${active ? "border-foreground bg-foreground text-background" : "border-border bg-background text-foreground hover:bg-[var(--color-neutral-warm)]"}`}
                  >
                    {n}
                  </button>
                );
              })}
              <PageBtn
                disabled={safePage === totalPages}
                onClick={() => setPage(safePage + 1)}
                aria="Next"
              >
                <ChevronRight size={16} />
              </PageBtn>
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="label-mono text-muted-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function SelectWrap({ children }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

function PageBtn({ disabled, onClick, children, aria }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={aria}
      className="grid h-10 w-10 place-items-center border border-border bg-background text-foreground disabled:opacity-30 hover:bg-[var(--color-neutral-warm)]"
    >
      {children}
    </button>
  );
}
