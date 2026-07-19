import { useMemo, useState } from "react";
import {
  Download,
  TrendingUp,
  Package,
  Sprout,
  Bean,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui";

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
    category: "Green Beans",
  },
  {
    name: "Robusta Roasted Medium",
    sold: 245,
    revenue: 36750,
    category: "Roasted Beans",
  },
  {
    name: "Coffee Seedlings (Excelsa)",
    sold: 180,
    revenue: 9000,
    category: "Seedlings",
  },
  {
    name: "Liberica Ground",
    sold: 95,
    revenue: 14250,
    category: "Ground Coffee",
  },
  {
    name: "Arabica Roasted Dark",
    sold: 60,
    revenue: 10800,
    category: "Roasted Beans",
  },
];

const FARMS_REPORT = [
  {
    id: "FM-001",
    address: "Sitio Malusak, Boac",
    size: 4.2,
    yieldKg: 1820,
    crops: 2,
  },
  {
    id: "FM-002",
    address: "Barangay Tugos, Mogpog",
    size: 2.6,
    yieldKg: 940,
    crops: 1,
  },
  {
    id: "FM-003",
    address: "Sitio Hinapulan, Gasan",
    size: 6.8,
    yieldKg: 3120,
    crops: 3,
  },
];

const HARVEST_REPORT = [
  {
    id: "HV-001",
    name: "Spring Arabica Lot A",
    category: "Arabica",
    yieldKg: 820,
    harvestedAt: "2026-05-12",
  },
  {
    id: "HV-002",
    name: "Robusta Cycle 2",
    category: "Robusta",
    yieldKg: 540,
    harvestedAt: "2026-06-02",
  },
  {
    id: "HV-003",
    name: "Liberica Field Pick",
    category: "Liberica",
    yieldKg: 310,
    harvestedAt: "2026-04-18",
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

const TABS = [
  { id: "sales", label: "Sales" },
  { id: "farm", label: "Farm" },
  { id: "harvest", label: "Harvest" },
];

export function ReportsPage() {
  const [tab, setTab] = useState("sales");

  const exportCsv = () => {
    const { filename, rows } = buildExport(tab);
    const csv = rows.map((r) => r.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-8 space-y-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div className="min-w-0">
          <p className="label-mono mb-2 text-accent">Analytics</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Reports
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sales, farm, and harvest performance across your operations.
          </p>
        </div>
        <Button onClick={exportCsv} className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-0 border-b border-border">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                "label-mono px-5 py-3 -mb-px border-b-2 transition-colors",
                active
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "sales" && <SalesTab />}
      {tab === "farm" && <FarmTab />}
      {tab === "harvest" && <HarvestTab />}
    </div>
  );
}

// ============ SALES TAB ============
function SalesTab() {
  const totalRevenue = SALES_TREND.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = SALES_TREND.reduce((s, d) => s + d.orders, 0);
  const avgOrder = totalRevenue / Math.max(totalOrders, 1);
  const topProduct = [...PRODUCTS_SOLD].sort((a, b) => b.sold - a.sold)[0];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Total Revenue"
          value={`₱${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
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
          value={topProduct.name}
          sub={`${topProduct.sold} sold`}
          icon={Bean}
        />
      </div>

      {/* Sales Trend + Most Sold Products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card eyebrow="Trend" title="Sales Trends">
          <SalesLineChart data={SALES_TREND} />
        </Card>

        <Card eyebrow="Ranking" title="Most Sold Products">
          <ProductBars data={PRODUCTS_SOLD} />
        </Card>
      </div>

      {/* Recent Sales table */}
      <Card eyebrow="Ledger" title="Recent Sales">
        <SimpleTable
          columns={[
            { k: "id", l: "Order" },
            { k: "buyer", l: "Buyer" },
            { k: "product", l: "Product" },
            { k: "qty", l: "Qty", align: "right" },
            {
              k: "total",
              l: "Total",
              align: "right",
              fmt: (v) => `₱${v.toLocaleString()}`,
            },
            { k: "date", l: "Date" },
          ]}
          rows={SALES_ORDERS}
        />
      </Card>
    </div>
  );
}

// ============ FARM TAB ============
function FarmTab() {
  const totalFarms = FARMS_REPORT.length;
  const totalHectares = FARMS_REPORT.reduce((s, f) => s + f.size, 0);
  const totalYield = FARMS_REPORT.reduce((s, f) => s + f.yieldKg, 0);
  const avgYieldPerHa = totalYield / Math.max(totalHectares, 1);

  return (
    <div className="space-y-8">
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
          value={`${Math.round(avgYieldPerHa).toLocaleString()} kg`}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card eyebrow="Report" title="Farms">
          <ProductBars
            data={FARMS_REPORT.map((f) => ({
              name: `${f.id} · ${f.address}`,
              sold: f.yieldKg,
              revenue: f.size,
            }))}
            unit="kg"
            subFmt={(d) => `${d.revenue} ha`}
          />
        </Card>

        <Card eyebrow="Ledger" title="Farm Breakdown">
          <SimpleTable
            columns={[
              { k: "id", l: "Farm" },
              { k: "address", l: "Address" },
              { k: "size", l: "Size (ha)", align: "right" },
              { k: "crops", l: "Crops", align: "right" },
              {
                k: "yieldKg",
                l: "Yield",
                align: "right",
                fmt: (v) => `${v.toLocaleString()} kg`,
              },
            ]}
            rows={FARMS_REPORT}
          />
        </Card>
      </div>
    </div>
  );
}

// ============ HARVEST TAB ============
function HarvestTab() {
  const total = HARVEST_REPORT.reduce((s, h) => s + h.yieldKg, 0);
  const byCat = HARVEST_REPORT.reduce((acc, h) => {
    acc[h.category] = (acc[h.category] || 0) + h.yieldKg;
    return acc;
  }, {});
  const catData = Object.entries(byCat).map(([name, sold]) => ({
    name,
    sold,
    revenue: 0,
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Harvests" value={HARVEST_REPORT.length} icon={Bean} />
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
          value={`${Math.round(total / HARVEST_REPORT.length).toLocaleString()} kg`}
          icon={TrendingUp}
        />
      </div>

      {/* Harvest Timeline + Yield by Category */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card eyebrow="Timeline" title="Harvests">
          <SalesLineChart
            data={[...HARVEST_REPORT]
              .sort((a, b) => new Date(a.harvestedAt) - new Date(b.harvestedAt))
              .map((h) => ({
                month: fmtShort(h.harvestedAt),
                revenue: h.yieldKg,
                orders: 1,
              }))}
            unit="kg"
            hideOrders
          />
        </Card>

        <Card eyebrow="Ranking" title="Yield by Category">
          <ProductBars data={catData} unit="kg" hideRevenue />
        </Card>
      </div>

      <Card eyebrow="Ledger" title="Harvest Records">
        <SimpleTable
          columns={[
            { k: "id", l: "ID" },
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
          rows={HARVEST_REPORT}
        />
      </Card>
    </div>
  );
}

// ============ PRIMITIVES ============
function Kpi({ label, value, sub, icon: Icon }) {
  return (
    <div className="border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="label-mono text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground truncate">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Card({ eyebrow, title, children }) {
  return (
    <section className="border border-border bg-card p-6">
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

function SalesLineChart({ data, unit = "₱", hideOrders = false }) {
  const W = 800;
  const H = 240;
  const PAD = 40;
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
        <path
          d={area}
          fill="var(--color-ledger-mustard, #d4a627)"
          opacity="0.15"
        />
        <path
          d={path}
          fill="none"
          stroke="var(--color-ledger-olive, #2f6f3e)"
          strokeWidth="2.5"
        />
        {pts.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="var(--color-ledger-olive, #2f6f3e)"
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
              y={p.y - 10}
              textAnchor="middle"
              className="fill-foreground"
              style={{ fontSize: 10, fontWeight: 600 }}
            >
              {unit}
              {p.revenue.toLocaleString()}
            </text>
          </g>
        ))}
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
          <div key={d.name}>
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
            <div className="h-2.5 w-full bg-muted">
              <div
                className="h-full transition-[width] duration-500"
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
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse text-sm">
        <thead className="bg-muted/60">
          <tr>
            {columns.map((c) => (
              <th
                key={c.k}
                className={[
                  "label-mono px-4 py-3 text-muted-foreground",
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
            <tr key={r.id || idx} className="border-t border-border">
              {columns.map((c) => (
                <td
                  key={c.k}
                  className={[
                    "px-4 py-3 text-foreground",
                    c.align === "right" ? "text-right font-mono" : "",
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
  );
}

// ============ HELPERS ============
function fmtShort(s) {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function csvCell(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function buildExport(tab) {
  const stamp = new Date().toISOString().slice(0, 10);
  if (tab === "sales") {
    const rows = [
      ["KapeKonek — Sales Report", stamp],
      [],
      ["Sales Trend"],
      ["Month", "Revenue", "Orders"],
      ...SALES_TREND.map((d) => [d.month, d.revenue, d.orders]),
      [],
      ["Most Sold Products"],
      ["Product", "Category", "Units Sold", "Revenue"],
      ...PRODUCTS_SOLD.map((p) => [p.name, p.category, p.sold, p.revenue]),
      [],
      ["Recent Sales"],
      ["Order", "Buyer", "Product", "Qty", "Total", "Date"],
      ...SALES_ORDERS.map((o) => [
        o.id,
        o.buyer,
        o.product,
        o.qty,
        o.total,
        o.date,
      ]),
    ];
    return { filename: `sales-report-${stamp}.csv`, rows };
  }
  if (tab === "farm") {
    const rows = [
      ["KapeKonek — Farm Report", stamp],
      [],
      ["Farms"],
      ["ID", "Address", "Size (ha)", "Crops", "Yield (kg)"],
      ...FARMS_REPORT.map((f) => [f.id, f.address, f.size, f.crops, f.yieldKg]),
    ];
    return { filename: `farm-report-${stamp}.csv`, rows };
  }
  const rows = [
    ["KapeKonek — Harvest Report", stamp],
    [],
    ["Harvests"],
    ["ID", "Name", "Category", "Yield (kg)", "Harvested At"],
    ...HARVEST_REPORT.map((h) => [
      h.id,
      h.name,
      h.category,
      h.yieldKg,
      h.harvestedAt,
    ]),
  ];
  return { filename: `harvest-report-${stamp}.csv`, rows };
}
