import { useEffect, useRef, useState } from "react";
import { Eye, FileText, Image as ImageIcon, RotateCcw, Upload, X } from "lucide-react";
import { Button, Field, IconButton, TextInput } from "@/components/ui";
import FieldError from "@/components/ui/FieldError";
import { DEFAULT_PASSWORD } from "@/constants/data";
import {
  createFarmerSchema,
  getFieldErrors,
  updateUserSchema,
} from "@/schemas/user.schema";
import { useCreateUser, useUpdateUser } from "@/hooks/useUsers";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { uploadToCloudinary } from "@/services/upload.service";
import { useToastStore } from "@/stores/toast.store";

export function FarmerModal({ mode, initial, onClose }) {
  const [form, setForm] = useState(initial);
  const [resetPassword, setResetPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState(() =>
    (initial.files ?? []).map((f) => ({ ...f })),
  );
  const [filesChanged, setFilesChanged] = useState(false);
  const [upload, setUpload] = useState({ active: false, percent: 0 });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const isPending = createUser.isPending || updateUser.isPending;
  const fileInputRef = useRef(null);
  const showToast = useToastStore((state) => state.show);
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

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const clearFileError = () =>
    setErrors((current) => {
      if (!current.files) return current;
      const next = { ...current };
      delete next.files;
      return next;
    });

  const onPickFiles = async (e) => {
    const list = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!list.length) return;

    const totalBytes = list.reduce((sum, file) => sum + file.size, 0);
    let completedBytes = 0;
    setUpload({ active: true, percent: 0 });

    for (const file of list) {
      try {
        const result = await uploadToCloudinary(file, "farmer", (loaded) => {
          const overall = ((completedBytes + loaded) / totalBytes) * 100;
          setUpload({ active: true, percent: Math.min(Math.round(overall), 99) });
        });
        completedBytes += file.size;
        setUpload({
          active: true,
          percent: Math.round((completedBytes / totalBytes) * 100),
        });
        setFiles((prev) => [
          ...prev,
          {
            name: file.name,
            url: result.secure_url,
            type: file.type?.startsWith("image/") ? "image" : "document",
            size: file.size,
          },
        ]);
        setFilesChanged(true);
        clearFileError();
      } catch (err) {
        showToast(getErrorMessage(err, "Failed to upload file"));
      }
    }

    setUpload({ active: false, percent: 100 });
  };

  const removeFile = (key) => {
    setFiles((prev) => prev.filter((f) => `${f.name}-${f.size}` !== key));
    setFilesChanged(true);
  };

  const submit = (e) => {
    e?.preventDefault();

    const payload = {
      lastName: form.lastName.trim(),
      firstName: form.firstName.trim(),
      middleName: form.middleName?.trim() || "",
      username: form.username?.trim() || "",
      email: form.email.trim(),
      contactNumber: form.contactNumber?.trim() || "",
      address: form.address?.trim() || "",
      ...(mode === "add" || filesChanged ? { files } : {}),
      ...(mode === "add" || resetPassword
        ? { password: DEFAULT_PASSWORD }
        : {}),
    };

    const schema = mode === "edit" ? updateUserSchema : createFarmerSchema;
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
        : { ...payload, role: "farmer" };

    mutation.mutate(variables, { onSuccess: onClose });
  };

  const modalTitle =
    mode === "view"
      ? `View ${initial.fullName || initial.firstName || "Farmer"}`
      : mode === "add"
        ? "Add New Farmer"
        : `Edit ${initial.fullName || initial.firstName || "Farmer"}`;

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
            <p className="label-mono mb-1 text-accent">Farmer</p>
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

            {/* Denial remarks — only present if this farmer's account was previously rejected */}
            {form.accountStatus === "rejected" && form.denyRemarks && (
              <SectionGroup title="Denial Remarks">
                <div className="border border-border bg-muted/30 p-4">
                  <p className="text-sm text-foreground">{form.denyRemarks}</p>
                </div>
              </SectionGroup>
            )}

            {/* Association denial remarks — only present if the association application was previously rejected */}
            {form.associationStatus === "rejected" &&
              form.associationDenyRemarks && (
                <SectionGroup title="Association Denial Remarks">
                  <div className="border border-border bg-muted/30 p-4">
                    <p className="text-sm text-foreground">
                      {form.associationDenyRemarks}
                    </p>
                  </div>
                </SectionGroup>
              )}

            {/* Attachments section */}
            <SectionGroup title="Attachments">
              {!readOnly && (
              <div
                onClick={() => !upload.active && fileInputRef.current?.click()}
                className={[
                  "flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-border bg-muted/30 px-4 py-6 text-center hover:bg-muted/50",
                  upload.active && "cursor-not-allowed opacity-60",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <Upload className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm font-medium text-foreground">
                  {upload.active ? "Uploading…" : "Click to upload files"}
                </div>
                <div className="text-xs text-muted-foreground">
                  PDF, images, or documents
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  disabled={upload.active}
                  className="hidden"
                  onChange={onPickFiles}
                />
              </div>
              )}

              {upload.active && (
                <div className="mt-3 border border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden bg-muted">
                      <div
                        className="h-full bg-accent transition-[width] duration-150"
                        style={{ width: `${upload.percent}%` }}
                      />
                    </div>
                    <span className="label-mono shrink-0 text-muted-foreground">
                      {upload.percent}%
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Uploading files…
                  </p>
                </div>
              )}

              {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {files.map((f) => {
                    const Icon = f.type === "image" ? ImageIcon : FileText;
                    return (
                      <li
                        key={`${f.name}-${f.size}`}
                        className="flex items-center justify-between gap-3 border border-border bg-background p-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center border border-border bg-muted">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-foreground">
                              {f.name}
                            </div>
                            <div className="label-mono text-muted-foreground">
                              {(f.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {f.url && (
                            <a
                              href={f.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-8 items-center gap-1.5 border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </a>
                          )}
                          {!readOnly && (
                            <IconButton
                              icon={X}
                              label="Remove"
                              onClick={() => removeFile(`${f.name}-${f.size}`)}
                            />
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <FieldError message={errors.files} />
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
                    ? "Add Farmer"
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
