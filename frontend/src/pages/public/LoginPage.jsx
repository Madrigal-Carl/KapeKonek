import { Link } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import hero from "@/assets/images/hero-coffee.jpg";

export default function LoginPage() {
  const [show, setShow] = useState(false);
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden lg:block">
        <img
          src={hero}
          alt="Coffee cherries"
          className="h-full w-full object-cover grayscale"
        />
      </div>
      <div className="relative flex items-center justify-center bg-background px-6 py-16">
        <Link
          to="/"
          className="label-mono absolute left-6 top-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} /> Return home
        </Link>
        <form onSubmit={(e) => e.preventDefault()} className="w-full max-w-sm">
          <span className="label-mono text-[var(--color-accent)]">Account</span>
          <h1 className="mt-4 text-3xl font-extrabold">Welcome back.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue to KapeKonek.
          </p>

          <div className="mt-10 space-y-5">
            <Field label="Email">
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="h-12 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
              />
            </Field>
            <Field label="Password">
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="h-12 w-full border border-border bg-background px-3 pr-10 text-sm outline-none focus:border-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center text-muted-foreground"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--color-accent)]"
                />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="label-mono text-[var(--color-accent)]">
                Forgot?
              </a>
            </div>

            <button
              type="submit"
              className="label-mono mt-2 w-full bg-[var(--color-accent)] px-5 py-4 text-[var(--color-accent-foreground)]"
            >
              Login
            </button>
            <Link
              to="/register"
              className="label-mono block w-full border border-foreground px-5 py-4 text-center text-foreground hover:bg-foreground hover:text-background"
            >
              Create Account
            </Link>
          </div>
        </form>
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
