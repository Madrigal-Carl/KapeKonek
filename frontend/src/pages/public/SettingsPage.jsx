import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, User } from "lucide-react";

export function SettingsPage({ onBack }) {
  const [show, setShow] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  return (
    <div className="kk-container py-6">
      <button
        type="button"
        onClick={handleBack}
        className="md:hidden label-mono flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Return
      </button>

      <span className="label-mono mt-8 block text-[var(--color-accent)]">
        Account
      </span>
      <h1 className="mt-3 text-3xl font-extrabold">Profile</h1>
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
          {/* Name */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Last Name">
              <input
                defaultValue="Dela Cruz"
                className="h-12 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
              />
            </Field>

            <Field label="First Name">
              <input
                defaultValue="Juan"
                className="h-12 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
              />
            </Field>
          </div>

          <Field label="Middle Name (Optional)">
            <input
              defaultValue=""
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

          <Field label="Contact Number">
            <input
              type="tel"
              defaultValue=""
              placeholder="09XX XXX XXXX"
              className="h-12 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
            />
          </Field>

          <Field label="Address">
            <input
              defaultValue=""
              placeholder="Street, Barangay, City/Municipality, Province"
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
