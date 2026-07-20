import { useEffect, useRef, useState } from "react";
import { RotateCcw, Upload, X } from "lucide-react";
import { Button, Field, IconButton, TextInput } from "@/components/ui";
import { DEFAULT_PASSWORD } from "@/constants/data";

export function FarmerModal({ mode, initial, onClose, onSave }) {
  const [form, setForm] = useState(initial);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const timersRef = useRef({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((id) => clearInterval(id));
    };
  }, []);

  const startUpload = (file) => {
    const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setFiles((prev) => [
      ...prev,
      { id, name: file.name, size: file.size, progress: 0 },
    ]);
    const timer = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f;
          const next = Math.min(100, f.progress + Math.random() * 18 + 6);
          if (next >= 100) {
            clearInterval(timer);
            delete timersRef.current[id];
          }
          return { ...f, progress: next };
        }),
      );
    }, 250);
    timersRef.current[id] = timer;
  };

  const onPickFiles = (e) => {
    const list = Array.from(e.target.files ?? []);
    list.forEach(startUpload);
    e.target.value = "";
  };

  const removeFile = (id) => {
    const t = timersRef.current[id];
    if (t) {
      clearInterval(t);
      delete timersRef.current[id];
    }
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const submit = (e) => {
    e?.preventDefault();
    if (
      !form.lastName?.trim() ||
      !form.firstName?.trim() ||
      !form.email?.trim()
    )
      return;
    onSave({
      ...form,
      lastName: form.lastName.trim(),
      firstName: form.firstName.trim(),
      middleName: form.middleName?.trim() || "",
      username: form.username?.trim() || "",
      email: form.email.trim(),
      contactNumber: form.contactNumber?.trim() || "",
      address: form.address?.trim() || "",
      fullName: [form.firstName, form.middleName, form.lastName]
        .filter(Boolean)
        .join(" ")
        .trim(),
    });
  };

  const modalTitle =
    mode === "add"
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
          <div className="space-y-8">
            {/* Personal information section */}
            <SectionGroup title="Personal Information">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Last Name">
                  <TextInput
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    placeholder="Dela Cruz"
                  />
                </Field>
                <Field label="First Name">
                  <TextInput
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    placeholder="Juan"
                  />
                </Field>
                <Field label="Middle Name (Optional)">
                  <TextInput
                    value={form.middleName}
                    onChange={(e) => set("middleName", e.target.value)}
                    placeholder="Santos"
                  />
                </Field>
                <Field label="Contact Number">
                  <TextInput
                    type="tel"
                    value={form.contactNumber}
                    onChange={(e) => set("contactNumber", e.target.value)}
                    placeholder="09XX XXX XXXX"
                  />
                </Field>
                <Field label="Address" full>
                  <TextInput
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="Street, Barangay, City/Municipality, Province"
                  />
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
                </Field>
                <Field label="Email" full>
                  <TextInput
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="name@kapekonek.ph"
                  />
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
                      onClick={() => set("password", DEFAULT_PASSWORD)}
                      className="mt-2 inline-flex items-center gap-1.5 self-start text-xs font-semibold text-accent hover:underline"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Reset to default
                      password
                    </button>
                  )}
                </Field>
              </div>
            </SectionGroup>

            {/* Attachments section */}
            <SectionGroup title="Attachments">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-border bg-muted/30 px-4 py-6 text-center hover:bg-muted/50"
              >
                <Upload className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm font-medium text-foreground">
                  Click to upload files
                </div>
                <div className="text-xs text-muted-foreground">
                  PDF, images, or documents
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={onPickFiles}
                />
              </div>

              {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {files.map((f) => (
                    <li
                      key={f.id}
                      className="border border-border bg-background p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-foreground">
                            {f.name}
                          </div>
                          <div className="label-mono text-muted-foreground">
                            {(f.size / 1024).toFixed(1)} KB ·{" "}
                            {Math.floor(f.progress)}%
                            {f.progress >= 100 ? " · done" : " · uploading"}
                          </div>
                        </div>
                        <IconButton
                          icon={X}
                          label="Remove"
                          onClick={() => removeFile(f.id)}
                        />
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden bg-muted">
                        <div
                          className="h-full bg-accent transition-[width] duration-200"
                          style={{ width: `${f.progress}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionGroup>
          </div>
        </form>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={submit}>
            {mode === "add" ? "Add Farmer" : "Save Changes"}
          </Button>
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
