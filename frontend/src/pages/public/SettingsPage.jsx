import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, User } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { updateMyProfile } from "@/services/user.service";

export function SettingsPage({ onBack }) {
  const { user, loading, fetchCurrentUser } = useAuth();

  const [show, setShow] = useState(false);
  const [form, setForm] = useState(() => ({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    middleName: user?.middleName ?? "",
    contactNumber: user?.contactNumber ?? "",
    address: user?.address ?? "",
  }));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null); // { type, text }

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    const password =
      newPassword.trim() || confirmPassword.trim() ? newPassword : undefined;
    if (newPassword || confirmPassword) {
      if (newPassword.length < 8) {
        setMsg({
          type: "error",
          text: "Password must be at least 8 characters.",
        });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMsg({ type: "error", text: "Passwords do not match." });
        return;
      }
    }

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      middleName: form.middleName.trim(),
      contactNumber: form.contactNumber.trim(),
      address: form.address.trim(),
      ...(password ? { password } : {}),
    };

    setSaving(true);
    try {
      await updateMyProfile(payload);
      await fetchCurrentUser();
      setNewPassword("");
      setConfirmPassword("");
      setMsg({
        type: "success",
        text: password
          ? "Profile and password updated successfully."
          : "Profile updated successfully.",
      });
    } catch (err) {
      setMsg({
        type: "error",
        text:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to update your profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const fullName = [form.firstName, form.middleName, form.lastName]
    .filter(Boolean)
    .join(" ");

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

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">
          Loading profile…
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[280px_1fr]">
          <div className="flex items-start gap-4 lg:flex-col lg:items-start">
            <div className="grid h-20 w-20 place-items-center border border-border bg-[var(--color-neutral-warm)]">
              <User size={28} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold">{fullName || "You"}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {user?.email}
              </p>
              {user?.address && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {user.address}
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Last Name">
                <input
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  className="h-12 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
                />
              </Field>

              <Field label="First Name">
                <input
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  className="h-12 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
                />
              </Field>
            </div>

            <Field label="Middle Name (Optional)">
              <input
                value={form.middleName}
                onChange={(e) => set("middleName", e.target.value)}
                className="h-12 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={user?.email ?? ""}
                readOnly
                className="h-12 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
              />
            </Field>

            <Field label="Contact Number">
              <input
                type="tel"
                value={form.contactNumber}
                onChange={(e) => set("contactNumber", e.target.value)}
                placeholder="09XX XXX XXXX"
                className="h-12 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
              />
            </Field>

            <Field label="Address">
              <input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
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
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="h-12 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
              />
            </Field>

            {msg && (
              <p
                className={
                  msg.type === "error"
                    ? "text-sm text-[var(--color-destructive)]"
                    : "text-sm text-foreground"
                }
              >
                {msg.text}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="label-mono bg-[var(--color-accent)] px-6 py-3.5 text-[var(--color-accent-foreground)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="label-mono border border-foreground px-6 py-3.5 text-foreground hover:bg-foreground hover:text-background"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
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
