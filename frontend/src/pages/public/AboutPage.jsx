import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  Sprout,
  ClipboardList,
  BarChart3,
  BookOpen,
  MapPin,
  Bell,
  Users,
} from "lucide-react";
import farm from "@/assets/images/coffee-farm.jpg";

export function AboutPage() {
  return (
    <div>
      <section className="border-b border-border bg-[var(--color-surface)]">
        <div className="kk-container grid gap-12 py-20 md:grid-cols-[1.05fr_1fr] md:items-center md:py-28">
          <div>
            <span className="label-mono text-[var(--color-accent)]">
              About · Platform
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl md:text-[3.25rem]">
              KapeKonek Ecosystem.
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground">
              A coffee-focused digital platform that brings farmers, buyers, and
              cooperatives onto one transparent, traceable, community-first
              marketplace.
            </p>
          </div>
          <img
            src={farm}
            alt="Coffee farm landscape"
            loading="lazy"
            width={1200}
            height={900}
            className="aspect-[4/3] w-full object-cover grayscale"
          />
        </div>
      </section>

      <section className="border-b border-border">
        <div className="kk-container grid gap-12 py-20 md:grid-cols-[1fr_2fr]">
          <div>
            <span className="label-mono text-[var(--color-accent)]">
              Mission
            </span>
            <h2 className="mt-4 text-3xl font-extrabold">
              Direct trade, shared knowledge.
            </h2>
          </div>
          <ul className="grid gap-px bg-border sm:grid-cols-2">
            {[
              "E-Commerce Marketplace",
              "Farmer Product Management",
              "Coffee Trading",
              "Advisory Knowledge Hub",
              "Community Collaboration",
              "Harvest Monitoring",
              "Farm Geotagging",
              "Role-Based Management",
            ].map((m) => (
              <li key={m} className="bg-background p-6">
                <span className="label-mono text-muted-foreground">Pillar</span>
                <p className="mt-2 text-base font-semibold">{m}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-border bg-[var(--color-surface)]">
        <div className="kk-container py-20">
          <span className="label-mono text-[var(--color-accent)]">
            Features
          </span>
          <h2 className="mt-4 max-w-2xl text-3xl font-extrabold">
            Built for the full coffee workflow.
          </h2>
          <div className="mt-12 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                i: ShoppingCart,
                t: "Marketplace",
                d: "List, browse, and buy across categories and origins.",
              },
              {
                i: Package,
                t: "Product Management",
                d: "Catalog tools for farmers and cooperatives.",
              },
              {
                i: Sprout,
                t: "Harvest Tracking",
                d: "Monitor cycles from flowering through drying.",
              },
              {
                i: ClipboardList,
                t: "Order Management",
                d: "Process, fulfill, and track every order.",
              },
              {
                i: BarChart3,
                t: "Reporting",
                d: "Sales, harvest, and inventory analytics.",
              },
              {
                i: BookOpen,
                t: "Knowledge Hub",
                d: "Guides, advisories, and agronomy resources.",
              },
              {
                i: MapPin,
                t: "Geotagging",
                d: "Farm-level origin and traceability.",
              },
              {
                i: Bell,
                t: "Notifications",
                d: "Order, harvest, and advisory updates.",
              },
              {
                i: Users,
                t: "Community Engagement",
                d: "Threads, discussions, and shared learning.",
              },
            ].map((f) => (
              <div key={f.t} className="bg-background p-8">
                <f.i size={22} className="text-[var(--color-accent)]" />
                <h3 className="mt-5 text-lg font-bold">{f.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="kk-container py-20 text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold">
            Discover coffee, direct from the farm.
          </h2>
          <Link
            to="/products"
            className="label-mono mt-8 inline-block bg-[var(--color-accent)] px-6 py-4 text-[var(--color-accent-foreground)]"
          >
            Browse Products
          </Link>
        </div>
      </section>
    </div>
  );
}
