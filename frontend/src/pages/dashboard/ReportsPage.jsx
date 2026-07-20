import { useMemo, useState } from "react";
import {
  Download,
  TrendingUp,
  TrendingDown,
  Package,
  Sprout,
  Bean,
  DollarSign,
  ChevronDown,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { Button, SingleSelect } from "@/components/ui";
import { ASSOCIATION_OPTIONS } from "@/constants/data";
import { CATEGORIES } from "@/constants/products";
import useAuth from "@/hooks/useAuth";

// ---- SEED DATA ----
const SALES_TREND = [
  { month: "Jan", revenue: 12400, orders: 42 },
  { month: "Feb", revenue: 15800, orders: 51 },
  { month: "Mar", revenue: 13200, orders: 47 },
  { month: "Apr", revenue: 18900, orders: 63 },
  { month: "May", revenue: 22400, orders: 78 },
  { month: "Jun", revenue: 26100, orders: 91 },
];

const PRODUCTS_SOLD = [
  {
    name: "Arabica Green Beans",
    sold: 320,
    revenue: 48000,
    category: "Coffee Beans",
  },
  {
    name: "Robusta Roasted Medium",
    sold: 245,
    revenue: 36750,
    category: "Coffee Beans",
  },
  {
    name: "Coffee Seedlings (Excelsa)",
    sold: 180,
    revenue: 9000,
    category: "Coffee Seedlings",
  },
  {
    name: "Liberica Ground",
    sold: 95,
    revenue: 14250,
    category: "Coffee Beans",
  },
  {
    name: "Arabica Roasted Dark",
    sold: 60,
    revenue: 10800,
    category: "Coffee Beans",
  },
];

const FARMS_REPORT = [
  {
    id: "FM-001",
    address: "Sitio Malusak, Boac",
    size: 4.2,
    yieldKg: 1820,
    crops: 2,
    farmer: "Lina Okoro",
  },
  {
    id: "FM-002",
    address: "Barangay Tugos, Mogpog",
    size: 2.6,
    yieldKg: 940,
    crops: 1,
    farmer: "Aisha Bello",
  },
  {
    id: "FM-003",
    address: "Sitio Hinapulan, Gasan",
    size: 6.8,
    yieldKg: 3120,
    crops: 3,
    farmer: "Chidi Okafor",
  },
];

const HARVEST_REPORT = [
  {
    id: "HV-001",
    name: "Spring Arabica Lot A",
    category: "Coffee Cherries",
    yieldKg: 820,
    harvestedAt: "2026-05-12",
    farmer: "Lina Okoro",
  },
  {
    id: "HV-002",
    name: "Robusta Cycle 2",
    category: "Coffee Cherries",
    yieldKg: 540,
    harvestedAt: "2026-06-02",
    farmer: "Samuel Mwangi",
  },
  {
    id: "HV-003",
    name: "Liberica Field Pick",
    category: "Coffee Beans",
    yieldKg: 310,
    harvestedAt: "2026-04-18",
    farmer: "Chidi Okafor",
  },
];

const SALES_ORDERS = [
  {
    id: "OR-1042",
    buyer: "Café Luzon",
    product: "Arabica Green Beans",
    qty: 40,
    total: 6000,
    date: "2026-06-14",
  },
  {
    id: "OR-1041",
    buyer: "Bean & Co.",
    product: "Robusta Roasted Medium",
    qty: 25,
    total: 3750,
    date: "2026-06-11",
  },
  {
    id: "OR-1040",
    buyer: "Harvest House",
    product: "Coffee Seedlings (Excelsa)",
    qty: 60,
    total: 3000,
    date: "2026-06-07",
  },
  {
    id: "OR-1039",
    buyer: "Batangas Roasters",
    product: "Arabica Green Beans",
    qty: 80,
    total: 12000,
    date: "2026-06-02",
  },
  {
    id: "OR-1038",
    buyer: "Café Luzon",
    product: "Liberica Ground",
    qty: 15,
    total: 2250,
    date: "2026-05-28",
  },
];

const FARMERS_REPORT = [
  {
    id: "FR-001",
    fullName: "Lina Okoro",
    association: "Boac Farmers Cooperative Association",
    farmCount: 2,
    joinedAt: "2026-01-04",
  },
  {
    id: "FR-002",
    fullName: "Samuel Mwangi",
    association: "Mogpog Growers Association",
    farmCount: 1,
    joinedAt: "2026-01-18",
  },
  {
    id: "FR-003",
    fullName: "Aisha Bello",
    association: "—",
    farmCount: 3,
    joinedAt: "2026-05-22",
  },
  {
    id: "FR-004",
    fullName: "Chidi Okafor",
    association: "—",
    farmCount: 1,
    joinedAt: "2026-06-01",
  },
  {
    id: "FR-005",
    fullName: "Joseph Kamau",
    association: "Boac Farmers Cooperative Association",
    farmCount: 2,
    joinedAt: "2025-11-14",
  },
];

const FARMER_NAMES = [...new Set(FARMERS_REPORT.map((f) => f.fullName))];

const TABS = [
  { id: "sales", label: "Sales", icon: DollarSign },
  { id: "farm", label: "Farm", icon: Sprout },
  { id: "harvest", label: "Harvest", icon: Bean },
];

const DATE_RANGE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "This Day" },
  { value: "month", label: "This Month" },
  { value: "semiannual", label: "This Semiannual" },
  { value: "year", label: "This Year" },
];

const ASSOCIATION_FILTER_OPTIONS = ["All Associations", ...ASSOCIATION_OPTIONS];
const CATEGORY_FILTER_OPTIONS = ["All Categories", ...CATEGORIES];
const FARMER_FILTER_OPTIONS = ["All Farmers", ...FARMER_NAMES];

const DEFAULT_FILTERS = {
  dateRange: "all",
  association: "All Associations",
  category: "All Categories",
  farmer: "All Farmers",
};

export function ReportsPage() {
  const { role } = useAuth();
  const canFilterByFarmer = role === "kaluppa";

  const [tab, setTab] = useState("sales");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (filters.dateRange !== "all") {
      chips.push({
        key: "dateRange",
        label: DATE_RANGE_OPTIONS.find((o) => o.value === filters.dateRange)
          ?.label,
      });
    }
    if (filters.association !== "All Associations") {
      chips.push({ key: "association", label: filters.association });
    }
    if (filters.category !== "All Categories") {
      chips.push({ key: "category", label: filters.category });
    }
    if (canFilterByFarmer && filters.farmer !== "All Farmers") {
      chips.push({ key: "farmer", label: filters.farmer });
    }
    return chips;
  }, [filters, canFilterByFarmer]);

  const clearChip = (key) => setFilter(key, DEFAULT_FILTERS[key]);

  // ---- Filtered datasets ----
  const filteredSalesOrders = useMemo(
    () => SALES_ORDERS.filter((o) => inDateRange(o.date, filters.dateRange)),
    [filters.dateRange],
  );

  const filteredProducts = useMemo(
    () =>
      PRODUCTS_SOLD.filter(
        (p) =>
          filters.category === "All Categories" ||
          p.category === filters.category,
      ),
    [filters.category],
  );

  const filteredFarms = useMemo(
    () =>
      FARMS_REPORT.filter(
        (f) => filters.farmer === "All Farmers" || f.farmer === filters.farmer,
      ),
    [filters.farmer],
  );

  const filteredHarvests = useMemo(
    () =>
      HARVEST_REPORT.filter(
        (h) =>
          inDateRange(h.harvestedAt, filters.dateRange) &&
          (filters.category === "All Categories" ||
            h.category === filters.category) &&
          (filters.farmer === "All Farmers" || h.farmer === filters.farmer),
      ),
    [filters.dateRange, filters.category, filters.farmer],
  );

  const filteredFarmers = useMemo(
    () =>
      FARMERS_REPORT.filter(
        (f) =>
          inDateRange(f.joinedAt, filters.dateRange) &&
          (filters.association === "All Associations" ||
            f.association === filters.association) &&
          (filters.farmer === "All Farmers" || f.fullName === filters.farmer),
      ),
    [filters.dateRange, filters.association, filters.farmer],
  );

  return (
    <div className="py-8 space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-border">
        <div className="min-w-0">
          <p className="label-mono mb-2 text-accent">Analytics</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Reports
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sales, farm, and harvest performance across your operations.
          </p>
        </div>
        <Button disabled className="gap-2 opacity-60 cursor-not-allowed">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Segmented tabs */}
      <div className="inline-flex items-center gap-0.5 rounded-xl bg-muted p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                "label-mono inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-all",
                active
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="label-mono">Filters</span>
          {activeFilterChips.length > 0 && (
            <button
              onClick={resetFilters}
              className="label-mono ml-auto text-accent hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        <div
          className={[
            "grid grid-cols-1 gap-3 sm:grid-cols-2",
            canFilterByFarmer ? "lg:grid-cols-4" : "lg:grid-cols-3",
          ].join(" ")}
        >
          <SelectFilter
            label="Date Range"
            value={filters.dateRange}
            onChange={(v) => setFilter("dateRange", v)}
            options={DATE_RANGE_OPTIONS}
          />

          <div>
            <span className="label-mono mb-1.5 block text-muted-foreground">
              Association
            </span>
            <SingleSelect
              value={filters.association}
              onChange={(v) => setFilter("association", v)}
              options={ASSOCIATION_FILTER_OPTIONS}
              placeholder="All Associations"
              searchPlaceholder="Search associations…"
            />
          </div>

          <div>
            <span className="label-mono mb-1.5 block text-muted-foreground">
              Category
            </span>
            <SingleSelect
              value={filters.category}
              onChange={(v) => setFilter("category", v)}
              options={CATEGORY_FILTER_OPTIONS}
              placeholder="All Categories"
              searchPlaceholder="Search categories…"
            />
          </div>

          {canFilterByFarmer && (
            <div>
              <span className="label-mono mb-1.5 block text-muted-foreground">
                Farmer
              </span>
              <SingleSelect
                value={filters.farmer}
                onChange={(v) => setFilter("farmer", v)}
                options={FARMER_FILTER_OPTIONS}
                placeholder="All Farmers"
                searchPlaceholder="Search farmers…"
              />
            </div>
          )}
        </div>

        {activeFilterChips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
            {activeFilterChips.map((chip) => (
              <button
                key={chip.key}
                onClick={() => clearChip(chip.key)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-foreground transition-colors hover:border-accent/40 hover:bg-accent/10"
              >
                {chip.label}
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === "sales" && (
        <SalesTab orders={filteredSalesOrders} products={filteredProducts} />
      )}
      {tab === "farm" && (
        <FarmTab farms={filteredFarms} farmers={filteredFarmers} />
      )}
      {tab === "harvest" && <HarvestTab harvests={filteredHarvests} />}
    </div>
  );
}

// ============ FILTER SELECT (native, used for Date Range) ============
function SelectFilter({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="label-mono mb-1.5 block text-muted-foreground">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-border bg-background py-2.5 pl-3 pr-9 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </label>
  );
}

// ============ SALES TAB ============
function SalesTab({ orders, products }) {
  const totalRevenue = orders.reduce((s, d) => s + d.total, 0);
  const totalOrders = orders.length;
  const avgOrder = totalRevenue / Math.max(totalOrders, 1);
  const topProduct = [...products].sort((a, b) => b.sold - a.sold)[0];

  const revTrend = trendPct(SALES_TREND.map((d) => d.revenue));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Total Revenue"
          value={`₱${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={revTrend}
        />
        <Kpi
          label="Orders"
          value={totalOrders.toLocaleString()}
          icon={Package}
        />
        <Kpi
          label="Avg. Order"
          value={`₱${Math.round(avgOrder).toLocaleString()}`}
          icon={TrendingUp}
        />
        <Kpi
          label="Top Product"
          value={topProduct?.name ?? "—"}
          sub={topProduct ? `${topProduct.sold} sold` : "No matches"}
          icon={Bean}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card eyebrow="Trend" title="Sales Trends">
          <SalesLineChart data={SALES_TREND} />
        </Card>

        <Card eyebrow="Ranking" title="Most Sold Products">
          {products.length ? (
            <ProductBars data={products} />
          ) : (
            <EmptyNote text="No products match the current filters." />
          )}
        </Card>
      </div>

      <Card eyebrow="Ledger" title="Recent Sales">
        {orders.length ? (
          <SimpleTable
            columns={[
              { k: "id", l: "Order", primary: true },
              { k: "product", l: "Product" },
              { k: "qty", l: "Qty", align: "right" },
              {
                k: "total",
                l: "Total",
                align: "right",
                fmt: (v) => `₱${v.toLocaleString()}`,
              },
              { k: "date", l: "Date", fmt: fmtShort },
            ]}
            rows={orders}
          />
        ) : (
          <EmptyNote text="No sales match the current filters." />
        )}
      </Card>
    </div>
  );
}

// ============ FARM TAB ============
function FarmTab({ farms, farmers }) {
  const totalFarms = farms.length;
  const totalHectares = farms.reduce((s, f) => s + f.size, 0);
  const totalYield = farms.reduce((s, f) => s + f.yieldKg, 0);
  const avgYieldPerHa = totalYield / Math.max(totalHectares, 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Farms" value={totalFarms} icon={Sprout} />
        <Kpi
          label="Total Area"
          value={`${totalHectares.toFixed(1)} ha`}
          icon={Sprout}
        />
        <Kpi
          label="Total Yield"
          value={`${totalYield.toLocaleString()} kg`}
          icon={Bean}
        />
        <Kpi
          label="Yield / ha"
          value={`${Math.round(avgYieldPerHa || 0).toLocaleString()} kg`}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card eyebrow="Report" title="Farms">
          {farms.length ? (
            <ProductBars
              data={farms.map((f) => ({
                name: `${f.id} · ${f.address}`,
                sold: f.yieldKg,
                revenue: f.size,
              }))}
              unit="kg"
              subFmt={(d) => `${d.revenue} ha`}
            />
          ) : (
            <EmptyNote text="No farms match the current filters." />
          )}
        </Card>

        <Card eyebrow="Ledger" title="Farm Breakdown">
          {farms.length ? (
            <SimpleTable
              columns={[
                { k: "id", l: "Farm", primary: true },
                { k: "address", l: "Address" },
                { k: "size", l: "Size (ha)", align: "right" },
                {
                  k: "yieldKg",
                  l: "Yield",
                  align: "right",
                  fmt: (v) => `${v.toLocaleString()} kg`,
                },
              ]}
              rows={farms}
            />
          ) : (
            <EmptyNote text="No farms match the current filters." />
          )}
        </Card>
      </div>

      <Card eyebrow="Ledger" title="Recent Farmers">
        {farmers.length ? (
          <SimpleTable
            columns={[
              { k: "fullName", l: "Farmer", primary: true },
              { k: "association", l: "Association" },
              { k: "farmCount", l: "Farms", align: "right" },
              { k: "joinedAt", l: "Joined At", fmt: fmtShort },
            ]}
            rows={farmers}
          />
        ) : (
          <EmptyNote text="No farmers match the current filters." />
        )}
      </Card>
    </div>
  );
}

// ============ HARVEST TAB ============
function HarvestTab({ harvests }) {
  const total = harvests.reduce((s, h) => s + h.yieldKg, 0);
  const byCat = harvests.reduce((acc, h) => {
    acc[h.category] = (acc[h.category] || 0) + h.yieldKg;
    return acc;
  }, {});
  const catData = Object.entries(byCat).map(([name, sold]) => ({
    name,
    sold,
    revenue: 0,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Harvests" value={harvests.length} icon={Bean} />
        <Kpi
          label="Total Yield"
          value={`${total.toLocaleString()} kg`}
          icon={Bean}
        />
        <Kpi
          label="Categories"
          value={Object.keys(byCat).length}
          icon={Sprout}
        />
        <Kpi
          label="Avg / Harvest"
          value={`${Math.round(
            total / Math.max(harvests.length, 1),
          ).toLocaleString()} kg`}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card eyebrow="Timeline" title="Harvests">
          {harvests.length ? (
            <SalesLineChart
              data={[...harvests]
                .sort(
                  (a, b) => new Date(a.harvestedAt) - new Date(b.harvestedAt),
                )
                .map((h) => ({
                  month: fmtShort(h.harvestedAt),
                  revenue: h.yieldKg,
                  orders: 1,
                }))}
              unit="kg"
              hideOrders
            />
          ) : (
            <EmptyNote text="No harvests match the current filters." />
          )}
        </Card>

        <Card eyebrow="Ranking" title="Yield by Category">
          {catData.length ? (
            <ProductBars data={catData} unit="kg" hideRevenue />
          ) : (
            <EmptyNote text="No harvests match the current filters." />
          )}
        </Card>
      </div>

      <Card eyebrow="Ledger" title="Harvest Records">
        {harvests.length ? (
          <SimpleTable
            columns={[
              { k: "id", l: "ID", primary: true },
              { k: "name", l: "Harvest" },
              { k: "category", l: "Category" },
              {
                k: "yieldKg",
                l: "Yield",
                align: "right",
                fmt: (v) => `${v.toLocaleString()} kg`,
              },
              { k: "harvestedAt", l: "Date", fmt: fmtShort },
            ]}
            rows={harvests}
          />
        ) : (
          <EmptyNote text="No harvests match the current filters." />
        )}
      </Card>
    </div>
  );
}

// ============ PRIMITIVES ============
function Kpi({ label, value, sub, icon: Icon, trend }) {
  const positive = typeof trend === "number" && trend >= 0;
  return (
    <div className="group rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="label-mono text-muted-foreground">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 truncate text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <div className="mt-1 flex items-center gap-1.5">
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        {typeof trend === "number" && (
          <span
            className={[
              "inline-flex items-center gap-0.5 text-xs font-medium",
              positive ? "text-emerald-600" : "text-rose-600",
            ].join(" ")}
          >
            {positive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(trend)}% vs. prior month
          </span>
        )}
      </div>
    </div>
  );
}

function Card({ eyebrow, title, children }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <p className="label-mono text-accent">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function EmptyNote({ text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
      <Package className="h-5 w-5 text-muted-foreground" />
      <p className="max-w-[220px] text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function SalesLineChart({ data, unit = "₱", hideOrders = false }) {
  const W = 800;
  const H = 240;
  const PAD = 40;
  const gradientId = useMemo(
    () => `chart-fill-${Math.random().toString(36).slice(2)}`,
    [],
  );
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const stepX = (W - PAD * 2) / Math.max(data.length - 1, 1);
  const pts = data.map((d, i) => ({
    x: PAD + i * stepX,
    y: H - PAD - (d.revenue / max) * (H - PAD * 2),
    ...d,
  }));
  const path = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const area = `${path} L ${pts[pts.length - 1].x} ${H - PAD} L ${pts[0].x} ${H - PAD} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: 400, height: H }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-ledger-mustard, #d4a627)"
              stopOpacity="0.28"
            />
            <stop
              offset="100%"
              stopColor="var(--color-ledger-mustard, #d4a627)"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((p) => {
          const y = H - PAD - p * (H - PAD * 2);
          return (
            <g key={p}>
              <line
                x1={PAD}
                x2={W - PAD}
                y1={y}
                y2={y}
                stroke="var(--color-ledger-rule, hsl(var(--border)))"
                strokeWidth="1"
                strokeDasharray={p === 0 ? "0" : "3 3"}
              />
              <text
                x={PAD - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-muted-foreground"
                style={{ fontSize: 10 }}
              >
                {unit}
                {Math.round(max * p).toLocaleString()}
              </text>
            </g>
          );
        })}

        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={path}
          fill="none"
          stroke="var(--color-ledger-olive, #2f6f3e)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {pts.map((p, i) => {
          const isLast = i === pts.length - 1;
          return (
            <g key={i} className="cursor-pointer">
              <title>
                {p.month}: {unit}
                {p.revenue.toLocaleString()}
                {!hideOrders ? ` · ${p.orders} orders` : ""}
              </title>
              {isLast && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="8"
                  fill="var(--color-ledger-olive, #2f6f3e)"
                  opacity="0.15"
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={isLast ? "5" : "4"}
                fill="var(--color-ledger-olive, #2f6f3e)"
                stroke="var(--color-card, #fff)"
                strokeWidth="2"
              />
              <text
                x={p.x}
                y={H - PAD + 18}
                textAnchor="middle"
                className="fill-muted-foreground"
                style={{ fontSize: 10 }}
              >
                {p.month}
              </text>
              <text
                x={p.x}
                y={p.y - 12}
                textAnchor="middle"
                className="fill-foreground"
                style={{ fontSize: 10, fontWeight: 600 }}
              >
                {unit}
                {p.revenue.toLocaleString()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ProductBars({ data, unit = "sold", hideRevenue = false, subFmt }) {
  const max = Math.max(...data.map((d) => d.sold), 1);
  const tones = [
    "var(--color-ledger-olive, #2f6f3e)",
    "var(--color-ledger-terracotta, #b8593a)",
    "var(--color-ledger-mustard, #d4a627)",
    "var(--color-ledger-tan, #c8a171)",
    "var(--color-ledger-clay, #a94b3a)",
  ];
  return (
    <div className="space-y-5">
      {data.map((d, i) => {
        const pct = (d.sold / max) * 100;
        return (
          <div key={d.name} className="group">
            <div className="mb-2 flex items-end justify-between gap-4">
              <span className="text-sm font-semibold text-foreground truncate">
                {d.name}
              </span>
              <span className="font-mono text-xs text-foreground shrink-0">
                {d.sold.toLocaleString()} {unit}
                {!hideRevenue && d.revenue > 0 && (
                  <span className="text-muted-foreground">
                    {" "}
                    · ₱{d.revenue.toLocaleString()}
                  </span>
                )}
                {subFmt && (
                  <span className="text-muted-foreground"> · {subFmt(d)}</span>
                )}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500 group-hover:brightness-110"
                style={{
                  width: `${pct}%`,
                  background: tones[i % tones.length],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SimpleTable({ columns, rows }) {
  const primaryKey = columns.find((c) => c.primary)?.k ?? columns[0].k;

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden w-full overflow-x-auto sm:block">
        <table className="w-full min-w-[600px] table-fixed border-collapse text-sm">
          <thead>
            <tr className="sticky top-0 bg-card">
              {columns.map((c) => (
                <th
                  key={c.k}
                  style={{ width: `${100 / columns.length}%` }}
                  className={[
                    "label-mono border-b border-border px-4 py-3 text-muted-foreground",
                    c.align === "right" ? "text-right" : "text-left",
                  ].join(" ")}
                >
                  {c.l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr
                key={r.id || idx}
                className={[
                  "border-t border-border transition-colors hover:bg-muted/50",
                  idx % 2 === 1 ? "bg-muted/20" : "",
                ].join(" ")}
              >
                {columns.map((c) => (
                  <td
                    key={c.k}
                    className={[
                      "truncate px-4 py-3 text-foreground",
                      c.align === "right"
                        ? "text-right font-mono"
                        : "text-left",
                      c.k === primaryKey ? "font-medium" : "",
                    ].join(" ")}
                  >
                    {c.fmt ? c.fmt(r[c.k]) : r[c.k]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="divide-y divide-border sm:hidden">
        {rows.map((r, idx) => (
          <div key={r.id || idx} className="py-3">
            <p className="text-sm font-semibold text-foreground">
              {r[primaryKey]}
            </p>
            <dl className="mt-1.5 space-y-1">
              {columns
                .filter((c) => c.k !== primaryKey)
                .map((c) => (
                  <div
                    key={c.k}
                    className="flex items-center justify-between gap-3"
                  >
                    <dt className="label-mono text-muted-foreground">{c.l}</dt>
                    <dd className="truncate text-foreground">
                      {c.fmt ? c.fmt(r[c.k]) : r[c.k]}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}

// ============ HELPERS ============
function fmtShort(s) {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function trendPct(series) {
  if (series.length < 2) return null;
  const prev = series[series.length - 2];
  const curr = series[series.length - 1];
  if (!prev) return null;
  return Math.round(((curr - prev) / prev) * 100);
}

function inDateRange(dateStr, range) {
  if (range === "all") return true;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return true;
  const now = new Date();

  if (range === "today") {
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }
  if (range === "month") {
    return (
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    );
  }
  if (range === "semiannual") {
    const half = (m) => (m < 6 ? 0 : 1);
    return (
      d.getFullYear() === now.getFullYear() &&
      half(d.getMonth()) === half(now.getMonth())
    );
  }
  if (range === "year") {
    return d.getFullYear() === now.getFullYear();
  }
  return true;
}
