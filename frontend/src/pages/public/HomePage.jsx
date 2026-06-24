import { Link } from "react-router-dom";
import {
  ArrowRight,
  Compass,
  Users,
  ShieldCheck,
  Sprout,
  Package,
  BookOpen,
} from "lucide-react";
import hero from "@/assets/images/hero-coffee.jpg";
import community from "@/assets/images/community.jpg";
import { ProductCard } from "@/components/public";
import { PRODUCTS } from "@/constants/products";

export default function HomePage() {
  const featured = PRODUCTS.slice(0, 4);
  return (
    <div>
      {/* HERO */}
      <section className="border-b border-border bg-[var(--color-surface)]">
        <div className="kk-container grid gap-10 py-16 md:grid-cols-[1.05fr_1fr] md:gap-16 md:py-24">
          <div className="flex flex-col justify-center">
            <span className="label-mono text-[var(--color-accent)]">
              01 · Coffee Ecosystem
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-5xl md:text-[3.5rem]">
              Connecting Coffee
              <br />
              Farmers and Buyers.
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground">
              A direct-from-farm marketplace, knowledge hub, and harvest tracker
              — built for growers, cooperatives, and the people who buy from
              them.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/products"
                className="label-mono inline-flex items-center gap-2 bg-[var(--color-accent)] px-6 py-4 text-[var(--color-accent-foreground)] transition-transform active:scale-[0.98]"
              >
                Browse Products <ArrowRight size={14} />
              </Link>
              <Link
                to="/about"
                className="label-mono inline-flex items-center gap-2 border border-foreground px-6 py-4 text-foreground hover:bg-foreground hover:text-background"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
              src={hero}
              alt="Hands holding freshly harvested coffee cherries"
              width={1600}
              height={1200}
              className="aspect-[4/5] w-full object-cover grayscale"
            />
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="border-b border-border">
        <div className="kk-container py-20">
          <SectionHead
            index="02"
            eyebrow="Platform"
            title="A coffee ecosystem, end to end."
          />
          <div className="mt-12 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Compass,
                t: "Coffee Marketplace",
                d: "Discover and order from verified farms and cooperatives.",
              },
              {
                icon: BookOpen,
                t: "Farmer Knowledge Hub",
                d: "Advisory content, agronomy guides, and shared best practice.",
              },
              {
                icon: ShieldCheck,
                t: "Verified Sellers",
                d: "Profiles, ratings, and traceability for every listing.",
              },
              {
                icon: Sprout,
                t: "Harvest Management",
                d: "Track cycles from flowering through processing.",
              },
              {
                icon: Package,
                t: "Product Tracking",
                d: "Lot-level monitoring across roasts and shipments.",
              },
              {
                icon: Users,
                t: "Community Collaboration",
                d: "A space for farmers, buyers, and coops to coordinate.",
              },
            ].map((c) => (
              <div key={c.t} className="bg-background p-8">
                <c.icon size={22} className="text-[var(--color-accent)]" />
                <h3 className="mt-5 text-lg font-bold">{c.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="border-b border-border bg-[var(--color-surface)]">
        <div className="kk-container py-20">
          <div className="flex items-end justify-between gap-6">
            <SectionHead
              index="03"
              eyebrow="Marketplace"
              title="Featured products."
            />
            <Link
              to="/products"
              className="label-mono hidden items-center gap-2 text-foreground hover:text-[var(--color-accent)] sm:inline-flex"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b border-border">
        <div className="kk-container py-20">
          <SectionHead index="04" eyebrow="Process" title="How it works." />
          <ol className="mt-12 grid gap-px bg-border md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Discover Coffee Products",
                d: "Browse a curated catalog of beans, green, ground, and specialty lots.",
              },
              {
                n: "02",
                t: "Connect with Farmers",
                d: "Read profiles, ratings, and traceable origin information.",
              },
              {
                n: "03",
                t: "Purchase and Track Orders",
                d: "Order, track shipments, and reorder across harvest cycles.",
              },
            ].map((s) => (
              <li key={s.n} className="bg-background p-8">
                <span className="label-mono text-[var(--color-accent)]">
                  Step {s.n}
                </span>
                <h3 className="mt-4 text-xl font-bold">{s.t}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="border-b border-border bg-foreground text-[var(--color-on-primary)]">
        <div className="kk-container grid gap-12 py-20 md:grid-cols-[1fr_1.1fr] md:items-center">
          <img
            src={community}
            alt="Farmers sorting coffee cherries"
            loading="lazy"
            width={1200}
            height={900}
            className="aspect-[4/3] w-full object-cover grayscale"
          />
          <div>
            <span className="label-mono text-[var(--color-accent)]">
              05 · Community
            </span>
            <h2 className="mt-6 text-3xl font-extrabold sm:text-4xl">
              A platform built around the people who grow it.
            </h2>
            <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                "Coffee Farmers",
                "Buyers",
                "Cooperatives",
                "Knowledge Sharing",
                "Advisory Hub",
                "Farm Management",
                "Product Monitoring",
                "Geotagging",
              ].map((k) => (
                <li
                  key={k}
                  className="label-mono border-l border-[color:color-mix(in_oklab,var(--color-on-primary)_25%,transparent)] pl-3"
                >
                  {k}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="kk-container py-20 text-center">
          <span className="label-mono text-[var(--color-accent)]">
            06 · Start
          </span>
          <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-extrabold sm:text-4xl">
            Explore the marketplace or create an account to begin.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to="/products"
              className="label-mono bg-[var(--color-accent)] px-6 py-4 text-[var(--color-accent-foreground)]"
            >
              Browse Products
            </Link>
            <Link
              to="/register"
              className="label-mono border border-foreground px-6 py-4 text-foreground hover:bg-foreground hover:text-background"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ k, v }) {
  return (
    <div>
      <dt className="label-mono text-muted-foreground">{k}</dt>
      <dd className="mt-2 text-2xl font-extrabold">{v}</dd>
    </div>
  );
}

function SectionHead({ index, eyebrow, title }) {
  return (
    <div className="grid gap-3">
      <span className="label-mono text-[var(--color-accent)]">
        {index} · {eyebrow}
      </span>
      <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}
