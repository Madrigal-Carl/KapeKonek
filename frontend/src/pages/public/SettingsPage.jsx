import { useState } from "react";
import { Eye, EyeOff, User } from "lucide-react";

export default function SettingsPage() {
  const [show, setShow] = useState(false);

  return (
    <div className="kk-container py-12">
      <span className="label-mono text-[var(--color-accent)]">Account</span>
      <h1 className="mt-3 text-3xl font-extrabold">Settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Update your personal details and password.
      </p>

      <div className="kk-rule mt-8" />

      <div className="mt-10 grid gap-10 lg:grid-cols-[280px_1fr]">
        <div className="flex items-start gap-4 lg:flex-col lg:items-start">
          <div className="grid h-20 w-20 place-items-center border border-border bg-[var(--color-neutral-warm)]">
            <User size={28} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-bold">Juan Dela Cruz</p>
            <p className="mt-1 text-sm text-muted-foreground">
              buyer@kapekonek.com
            </p>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <Field label="Full Name">
            <input
              defaultValue="Juan Dela Cruz"
              className="h-12 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              defaultValue="buyer@kapekonek.com"
              className="h-12 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
            />
          </Field>

          <div className="kk-rule pt-6">
            <span className="label-mono text-muted-foreground">
              Change Password
            </span>
          </div>

          <Field label="New Password">
            <div className="relative">
              <input
                type={show ? "text" : "password"}
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

          <Field label="Confirm New Password">
            <input
              type={show ? "text" : "password"}
              placeholder="••••••••"
              className="h-12 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="label-mono bg-[var(--color-accent)] px-6 py-3.5 text-[var(--color-accent-foreground)]"
            >
              Save Changes
            </button>
            <button
              type="button"
              className="label-mono border border-foreground px-6 py-3.5 text-foreground hover:bg-foreground hover:text-background"
            >
              Cancel
            </button>
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
