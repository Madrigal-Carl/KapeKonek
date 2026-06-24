import { Link } from "react-router-dom";
import { Coffee } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-foreground text-[var(--color-on-primary)]">
      <div className="kk-container grid gap-10 py-16 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center bg-[var(--color-on-primary)] text-foreground">
              <Coffee size={16} strokeWidth={2.4} />
            </span>
            <span className="text-base font-bold tracking-tight">
              KapeKonek
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-[color:color-mix(in_oklab,var(--color-on-primary)_70%,transparent)]">
            A coffee-focused digital ecosystem connecting farmers, buyers, and
            cooperatives through direct trade and shared knowledge.
          </p>
        </div>
        <FooterCol
          title="Platform"
          links={[
            ["Home", "/"],
            ["Products", "/products"],
            ["About", "/about"],
          ]}
        />
        <FooterCol
          title="Account"
          links={[
            ["Login", "/login"],
            ["Sign Up", "/signup"],
          ]}
        />
        <FooterCol
          title="Ecosystem"
          links={[
            ["Farmers", "/about"],
            ["Cooperatives", "/about"],
            ["Knowledge Hub", "/about"],
          ]}
        />
      </div>
      <div className="border-t border-[color:color-mix(in_oklab,var(--color-on-primary)_15%,transparent)]">
        <div className="kk-container flex flex-col items-start justify-between gap-2 py-6 sm:flex-row sm:items-center">
          <p className="label-mono text-[color:color-mix(in_oklab,var(--color-on-primary)_60%,transparent)]">
            © {new Date().getFullYear()} KapeKonek
          </p>
          <p className="label-mono text-[color:color-mix(in_oklab,var(--color-on-primary)_60%,transparent)]">
            Farm · Trade · Community
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="label-mono mb-4 text-[color:color-mix(in_oklab,var(--color-on-primary)_60%,transparent)]">
        {title}
      </h4>
      <ul className="space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              to={href}
              className="text-sm hover:text-[var(--color-accent)]"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
