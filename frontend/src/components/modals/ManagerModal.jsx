import { useEffect, useMemo, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import {
  Button,
  Field,
  IconButton,
  TextInput,
  MultiSelect,
} from "@/components/ui";
import FieldError from "@/components/ui/FieldError";
import { DEFAULT_PASSWORD } from "@/constants/data";
import {
  createManagerSchema,
  getFieldErrors,
  updateUserSchema,
} from "@/schemas/user.schema";
import {
  useAvailableFarmers,
  useCreateUser,
  useUpdateUser,
} from "@/hooks/useUsers";

export function ManagerModal({ mode, initial, onClose }) {
  const [form, setForm] = useState(() => ({
    ...initial,
    assignedFarmers: (initial.assignedFarmers ?? []).map(
      (farmer) => farmer._id ?? farmer,
    ),
  }));
  const [resetPassword, setResetPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const isPending = createUser.isPending || updateUser.isPending;
  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((current) => {
      if (!current[k]) return current;
      const next = { ...current };
      delete next[k];
      return next;
    });
  };

  const readOnly = mode === "view";

  const { data: availableFarmers = [] } = useAvailableFarmers();

  const farmerOptions = useMemo(() => {
    const assigned = (initial.assignedFarmers ?? []).map((farmer) => ({
      value: farmer._id ?? farmer,
      label: farmer.fullName ?? farmer,
    }));
    const seen = new Set(assigned.map((option) => option.value));

    return [
      ...assigned,
      ...availableFarmers
        .filter((farmer) => !seen.has(farmer._id))
        .map((farmer) => ({ value: farmer._id, label: farmer.fullName })),
    ];
  }, [initial.assignedFarmers, availableFarmers]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e) => {
    e?.preventDefault();

    const association = form.association?.trim() || "";

    const payload = {
      lastName: form.lastName.trim(),
      firstName: form.firstName.trim(),
      middleName: form.middleName?.trim() || "",
      username: form.username?.trim() || "",
      email: form.email.trim(),
      contactNumber: form.contactNumber?.trim() || "",
      address: form.address?.trim() || "",
      ...(association ? { association } : {}),
      assignedFarmers: form.assignedFarmers || [],
      ...(mode === "add" || resetPassword
        ? { password: DEFAULT_PASSWORD }
        : {}),
    };

    const schema = mode === "edit" ? updateUserSchema : createManagerSchema;
    const result = schema.safeParse(payload);

    if (!result.success) {
      setErrors(getFieldErrors(result.error));
      return;
    }

    setErrors({});

    const mutation = mode === "edit" ? updateUser : createUser;
    const variables =
      mode === "edit"
        ? { id: initial._id, data: payload }
        : { ...payload, role: "manager" };

    mutation.mutate(variables, { onSuccess: onClose });
  };

  const modalTitle =
    mode === "view"
      ? `View ${initial.fullName || initial.firstName || "Manager"}`
      : mode === "add"
        ? "Add New Manager"
        : `Edit ${initial.fullName || initial.firstName || "Manager"}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-40 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="label-mono mb-1 text-accent">Manager</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {modalTitle}
            </h2>
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5">
          <fieldset disabled={readOnly} className="space-y-8">
            {/* Personal information section */}
            <SectionGroup title="Personal Information">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Last Name">
                  <TextInput
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    placeholder="Dela Cruz"
                  />
                  <FieldError message={errors.lastName} />
                </Field>
                <Field label="First Name">
                  <TextInput
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    placeholder="Juan"
                  />
                  <FieldError message={errors.firstName} />
                </Field>
                <Field label="Middle Name (Optional)">
                  <TextInput
                    value={form.middleName}
                    onChange={(e) => set("middleName", e.target.value)}
                    placeholder="Santos"
                  />
                  <FieldError message={errors.middleName} />
                </Field>
                <Field label="Contact Number">
                  <TextInput
                    type="tel"
                    value={form.contactNumber}
                    onChange={(e) => set("contactNumber", e.target.value)}
                    placeholder="09XX XXX XXXX"
                  />
                  <FieldError message={errors.contactNumber} />
                </Field>
                <Field label="Address" full>
                  <TextInput
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="Street, Barangay, City/Municipality, Province"
                  />
                  <FieldError message={errors.address} />
                </Field>
              </div>
            </SectionGroup>

            {/* Account section */}
            <SectionGroup title="Account">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Username" full>
                  <TextInput
                    value={form.username}
                    onChange={(e) => set("username", e.target.value)}
                    placeholder="juandelacruz"
                  />
                  <FieldError message={errors.username} />
                </Field>
                <Field label="Email" full>
                  <TextInput
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="name@kapekonek.ph"
                  />
                  <FieldError message={errors.email} />
                </Field>
                <Field label="Default Password" full>
                  <TextInput
                    value={form.password}
                    readOnly
                    disabled
                    className="bg-muted/40"
                  />
                  {mode === "edit" && (
                    <button
                      type="button"
                      onClick={() => {
                        set("password", DEFAULT_PASSWORD);
                        setResetPassword(true);
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 self-start text-xs font-semibold text-accent hover:underline"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Reset to default
                      password
                    </button>
                  )}
                </Field>
              </div>
            </SectionGroup>

            {/* Community section */}
            <SectionGroup title="Community">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Association" full>
                  <TextInput
                    value={form.association}
                    onChange={(e) => set("association", e.target.value)}
                    placeholder="e.g. Boac Farmers Cooperative Association"
                  />
                  <FieldError message={errors.association} />
                </Field>

                <Field label="Farmer(s)" full>
                  <MultiSelect
                    values={form.assignedFarmers || []}
                    onChange={(v) => set("assignedFarmers", v)}
                    options={farmerOptions}
                    placeholder="Select farmer(s)…"
                  />
                </Field>
              </div>
            </SectionGroup>
          </fieldset>
        </form>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
          {readOnly ? (
            <Button type="button" onClick={onClose}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" onClick={submit} disabled={isPending}>
                {isPending
                  ? "Saving…"
                  : mode === "add"
                    ? "Add Manager"
                    : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionGroup({ title, children }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span className="label-mono shrink-0 text-muted-foreground">
          {title}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      {children}
    </div>
  );
}
