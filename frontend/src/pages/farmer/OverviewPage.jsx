import { Link } from "react-router-dom";
import { PageHeader } from "@/components/dashboard";
import {
  Sprout,
  Package,
  Bean,
  AlertTriangle,
  PackageX,
  ArrowUpRight,
} from "lucide-react";

const FARMS = [
  {
    id: "FM-001",
    address: "Sitio Malusak, Boac",
    size: 4.2,
    yieldKg: 1820,
    crops: [
      { crop: "Arabica", status: "growing" },
      { crop: "Banana", status: "planted" },
    ],
  },
  {
    id: "FM-002",
    address: "Barangay Tugos, Mogpog",
    size: 2.6,
    yieldKg: 940,
    crops: [{ crop: "Robusta", status: "harvested" }],
  },
  {
    id: "FM-003",
    address: "Sitio Hinapulan, Gasan",
    size: 6.8,
    yieldKg: 3120,
    crops: [
      { crop: "Liberica", status: "growing" },
      { crop: "Excelsa", status: "planted" },
      { crop: "Maize", status: "fallow" },
    ],
  },
];

const HARVESTS = [
  {
    id: "HV-001",
    name: "Spring Arabica Lot A",
    category: "Arabica",
    yieldKg: 820,
    farm: "FM-001",
    harvestedAt: "2026-05-12",
  },
  {
    id: "HV-002",
    name: "Robusta Cycle 2",
    category: "Robusta",
    yieldKg: 540,
    farm: "FM-002",
    harvestedAt: "2026-06-02",
  },
  {
    id: "HV-003",
    name: "Liberica Field Pick",
    category: "Liberica",
    yieldKg: 310,
    farm: "FM-003",
    harvestedAt: "2026-04-18",
  },
];

const INVENTORY = [
  {
    id: "PD-001",
    name: "Arabica Green Beans",
    category: "Green Beans",
    stock: 120,
    weightKg: 60,
    status: "active",
  },
  {
    id: "PD-002",
    name: "Robusta Roasted Medium",
    category: "Roasted Beans",
    stock: 45,
    weightKg: 22.5,
    status: "active",
  },
  {
    id: "PD-003",
    name: "Liberica Ground",
    category: "Ground Coffee",
    stock: 0,
    weightKg: 0,
    status: "inactive",
  },
  {
    id: "PD-004",
    name: "Coffee Seedlings (Excelsa)",
    category: "Seedlings",
    stock: 320,
    weightKg: 96,
    status: "active",
  },
];

const CHART_COLORS = [
  "var(--color-ledger-olive)",
  "var(--color-ledger-terracotta)",
  "var(--color-ledger-tan)",
  "var(--color-ledger-mustard)",
  "var(--color-ledger-olive-deep)",
  "var(--color-ledger-clay)",
];

// ---------- Reusable chart primitives (no deps) ----------
function StatCard({ label, value, sub, icon: Icon, to }) {
  const Wrapper = to ? Link : "div";
  const props = to ? { to } : {};
  return (
    <Wrapper
      {...props}
      className="group block border border-border bg-card p-5 transition-colors hover:border-foreground"
    >
      <div className="flex items-center justify-between">
        <p className="label-mono text-muted-foreground">{label}</p>
        <Icon className="h-6 w-6 text-accent" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </Wrapper>
  );
}

function BarChart({ data, height = 200, unit = "kg" }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const W = 100;
  const barW = W / data.length;
  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
      >
        {[0.25, 0.5, 0.75].map((p) => (
          <line
            key={p}
            x1="0"
            x2={W}
            y1={height * p}
            y2={height * p}
            stroke="hsl(var(--border))"
            strokeWidth="0.2"
          />
        ))}
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 24);
          const x = i * barW + barW * 0.18;
          const w = barW * 0.64;
          const y = height - h - 4;
          return (
            <g key={d.label}>
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill={d.color || CHART_COLORS[i % CHART_COLORS.length]}
              />
            </g>
          );
        })}
      </svg>
      <div
        className="mt-2 grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`,
        }}
      >
        {data.map((d, i) => (
          <div key={d.label} className="text-center">
            <p className="text-xs font-semibold text-foreground truncate">
              {d.value.toLocaleString()}
              {unit ? ` ${unit}` : ""}
            </p>
            <p className="label-mono text-[10px] text-muted-foreground truncate">
              {d.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({
  data,
  size = 180,
  thickness = 28,
  centerLabel,
  centerSub,
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={thickness}
        />
        {data.map((d, i) => {
          const len = (d.value / total) * c;
          const seg = (
            <circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color || CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += len;
          return seg;
        })}
        {centerLabel && (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-foreground"
            style={{ fontSize: 18, fontWeight: 600 }}
          >
            {centerLabel}
          </text>
        )}
        {centerSub && (
          <text
            x="50%"
            y="62%"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-muted-foreground"
            style={{ fontSize: 9 }}
          >
            {centerSub}
          </text>
        )}
      </svg>
      <ul className="space-y-2 text-sm">
        {data.map((d, i) => {
          const pct = ((d.value / total) * 100).toFixed(0);
          return (
            <li key={d.label} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5"
                style={{
                  background: d.color || CHART_COLORS[i % CHART_COLORS.length],
                }}
              />
              <span className="font-medium text-foreground">{d.label}</span>
              <span className="text-muted-foreground">
                · {d.value.toLocaleString()} ({pct}%)
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function HBar({ label, value, max, sub, color = "#2f6f3e" }) {
  const pct = (value / Math.max(max, 1)) * 100;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground truncate">{label}</span>
        <span className="text-muted-foreground shrink-0 ml-2">
          {sub ?? value.toLocaleString()}
        </span>
      </div>
      <div className="h-2.5 w-full bg-muted">
        <div
          className="h-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function fmtDate(s) {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function OverviewPage() {
  // Aggregates
  const totalFarms = FARMS.length;
  const totalHectares = FARMS.reduce((s, f) => s + f.size, 0);
  const totalFarmYield = FARMS.reduce((s, f) => s + f.yieldKg, 0);
  const totalHarvestKg = HARVESTS.reduce((s, h) => s + h.yieldKg, 0);
  const totalStock = INVENTORY.reduce((s, p) => s + p.stock, 0);
  const totalWeight = INVENTORY.reduce((s, p) => s + p.weightKg, 0);
  const outOfStock = INVENTORY.filter((p) => p.stock === 0).length;
  const activeProducts = INVENTORY.filter((p) => p.status === "active").length;

  // Farm yield bar chart
  const farmYieldData = FARMS.map((f, i) => ({
    label: f.id,
    value: f.yieldKg,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // Crop status donut
  const cropStatusCounts = FARMS.flatMap((f) => f.crops).reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});
  const cropStatusData = [
    {
      label: "Growing",
      value: cropStatusCounts.growing || 0,
      color: "var(--color-ledger-olive)",
    },
    {
      label: "Planted",
      value: cropStatusCounts.planted || 0,
      color: "var(--color-ledger-tan)",
    },
    {
      label: "Harvested",
      value: cropStatusCounts.harvested || 0,
      color: "var(--color-ledger-terracotta)",
    },
    {
      label: "Fallow",
      value: cropStatusCounts.fallow || 0,
      color: "var(--color-ledger-olive-deep)",
    },
  ].filter((d) => d.value > 0);

  // Harvest by category donut
  const harvestByCategory = HARVESTS.reduce((acc, h) => {
    acc[h.category] = (acc[h.category] || 0) + h.yieldKg;
    return acc;
  }, {});
  const harvestDonutData = Object.entries(harvestByCategory).map(
    ([label, value], i) => ({
      label,
      value,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }),
  );

  // Harvest timeline (sorted)
  const harvestTimeline = [...HARVESTS]
    .sort((a, b) => new Date(a.harvestedAt) - new Date(b.harvestedAt))
    .map((h, i) => ({
      label: fmtDate(h.harvestedAt),
      value: h.yieldKg,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

  // Inventory stock by product
  const stockMax = Math.max(...INVENTORY.map((p) => p.stock), 1);

  // Inventory category split by weight
  const invByCategory = INVENTORY.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.weightKg;
    return acc;
  }, {});
  const invDonutData = Object.entries(invByCategory)
    .filter(([, v]) => v > 0)
    .map(([label, value], i) => ({
      label,
      value,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

  return (
    <div className="py-8 space-y-10">
      <PageHeader
        eyebrow="Overview"
        title="Welcome back"
        description="Visual snapshot of farms, harvests, and inventory."
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Farms"
          value={totalFarms}
          sub={`${totalHectares.toFixed(1)} ha total`}
          icon={Sprout}
          to="/farm"
        />
        <StatCard
          label="Farm Yield"
          value={`${totalFarmYield.toLocaleString()} kg`}
          sub="Across all plots"
          icon={Bean}
          to="/farm"
        />
        <StatCard
          label="Out of Stock"
          value={outOfStock}
          sub={`${outOfStock === 1 ? "product needs" : "products need"} restocking`}
          icon={PackageX}
          to="/inventory"
        />
        <StatCard
          label="Inventory"
          value={totalStock.toLocaleString()}
          sub={`${activeProducts}/${INVENTORY.length} active · ${outOfStock} OOS`}
          icon={Package}
          to="/inventory"
        />
      </div>

      {/* Ledger charts */}
      <section className="grid grid-cols-1 gap-0 border border-ledger-rule lg:grid-cols-2">
        {/* Recent Yield — ledger bar chart */}
        <div className="flex flex-col bg-card p-8 border-b border-ledger-rule lg:border-b-0 lg:border-r">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="label-mono text-ledger-olive">Overview</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground underline decoration-ledger-mustard decoration-2 underline-offset-4">
                Recent Yield
              </h2>
            </div>
          </div>

          <YieldLedgerBars data={harvestTimeline} />

          <div className="mt-auto flex justify-between border-t border-border pt-6">
            <span className="label-mono text-muted-foreground">
              Current Cycle
            </span>
            <span className="label-mono font-bold text-foreground">
              {totalHarvestKg.toLocaleString()} kg logged
            </span>
          </div>
        </div>

        {/* Product Sold — ledger stock list */}
        <div className="flex flex-col bg-card p-8">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="label-mono text-ledger-terracotta">Inventory</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground underline decoration-ledger-olive decoration-2 underline-offset-4">
                Product Sold
              </h2>
            </div>
          </div>

          <div className="mb-8 space-y-6">
            {INVENTORY.map((p) => {
              const oos = p.stock === 0;
              const pct = (p.stock / Math.max(stockMax, 1)) * 100;
              const barColor = oos
                ? "var(--color-ledger-clay)"
                : p.category === "Green Beans"
                  ? "var(--color-ledger-olive)"
                  : p.category === "Roasted Beans"
                    ? "var(--color-ledger-tan)"
                    : "var(--color-ledger-olive-deep)";
              return (
                <div key={p.id}>
                  <div className="mb-2 flex items-end justify-between">
                    <span
                      className={`text-sm font-semibold ${oos ? "text-ledger-clay" : "text-foreground"}`}
                    >
                      {p.name}
                    </span>
                    <span
                      className={`font-mono text-xs ${oos ? "font-bold text-ledger-clay" : "text-foreground"}`}
                    >
                      {p.stock.toLocaleString()} pcs
                    </span>
                  </div>
                  <div className="h-2 w-full bg-ledger-track">
                    <div
                      className="h-full"
                      style={{ width: `${pct}%`, background: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {outOfStock > 0 && (
            <div className="mt-auto flex items-center justify-between bg-ledger-clay p-3">
              <div className="flex items-center gap-3 text-primary-foreground">
                <AlertTriangle
                  className="h-3.5 w-3.5 text-primary-foreground"
                  strokeWidth={2.5}
                />
                <span className="label-mono text-primary-foreground">
                  {outOfStock} product{outOfStock === 1 ? "" : "s"} out of stock
                </span>
              </div>
              <div className="label-mono border border-primary-foreground/40 px-2 py-0.5 text-primary-foreground transition-colors">
                Refill
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function YieldLedgerBars({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const tones = [
    "var(--color-ledger-olive)",
    "var(--color-ledger-terracotta)",
    "var(--color-ledger-tan)",
  ];
  return (
    <div className="mb-8 flex h-56 items-stretch justify-between gap-6 px-4">
      {data.map((d, i) => {
        const h = (d.value / max) * 100;
        return (
          <div
            key={d.label + i}
            className="group flex h-full flex-1 flex-col items-center justify-end"
          >
            <div
              className="w-full transition-[height] duration-500"
              style={{ height: `${h}%`, background: tones[i % tones.length] }}
              aria-label={`${d.value} kg on ${d.label}`}
            />
            <div className="mt-4 text-center">
              <p className="font-mono text-xs font-medium text-foreground">
                {d.value.toLocaleString()} kg
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                {d.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
