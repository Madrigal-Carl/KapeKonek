import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import farm from "@/assets/images/coffee-farm.jpg";

export default function RegisterPage() {
  const [role, setRole] = useState("buyer");
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative flex items-center justify-center bg-background px-6 py-16 lg:order-2">
        <Link
          to="/"
          className="label-mono absolute left-6 top-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} /> Return home
        </Link>
        <form onSubmit={(e) => e.preventDefault()} className="w-full max-w-sm">
          <span className="label-mono text-[var(--color-accent)]">
            Get Started
          </span>
          <h1 className="mt-4 text-3xl font-extrabold">Create your account.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join the KapeKonek coffee community.
          </p>

          <div className="mt-10 space-y-5">
            <Field label="Full Name">
              <input
                required
                placeholder="Your full name"
                className="h-12 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="h-12 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                required
                placeholder="••••••••"
                className="h-12 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
              />
            </Field>
            <Field label="Confirm Password">
              <input
                type="password"
                required
                placeholder="••••••••"
                className="h-12 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
              />
            </Field>
            <Field label="Account Type">
              <div className="grid grid-cols-2 border border-border">
                {["buyer", "farmer"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`label-mono px-4 py-3 ${role === r ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-[var(--color-neutral-warm)]"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </Field>

            <button
              type="submit"
              className="label-mono mt-2 w-full bg-[var(--color-accent)] px-5 py-4 text-[var(--color-accent-foreground)]"
            >
              Create Account
            </button>
            <Link
              to="/login"
              className="label-mono block w-full border border-foreground px-5 py-4 text-center text-foreground hover:bg-foreground hover:text-background"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
      <div className="hidden lg:order-1 lg:block">
        <img
          src={farm}
          alt="Coffee farm"
          className="h-full w-full object-cover grayscale"
        />
      </div>
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
