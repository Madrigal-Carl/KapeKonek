import { useEffect, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { Button, Field, IconButton, TextInput, MultiSelect } from "@/components/ui";
import { DEFAULT_PASSWORD, FARMER_OPTIONS } from "@/constants/data";

export function ManagerModal({ mode, initial, onClose, onSave }) {
    const [form, setForm] = useState(initial);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const submit = (e) => {
        e?.preventDefault();
        if (!form.fullName?.trim() || !form.email?.trim()) return;
        onSave({
            ...form,
            fullName: form.fullName.trim(),
            email: form.email.trim(),
        });
    };

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
                            {mode === "add" ? "Add New Manager" : `Edit ${initial.fullName}`}
                        </h2>
                    </div>
                    <IconButton icon={X} label="Close" onClick={onClose} />
                </div>

                <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Full Name" full>
                            <TextInput
                                value={form.fullName}
                                onChange={(e) => set("fullName", e.target.value)}
                                placeholder="Juan dela Cruz"
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

                        <Field label="Farmer(s)" full>
                            <MultiSelect
                                values={form.farmers || []}
                                onChange={(v) => set("farmers", v)}
                                options={FARMER_OPTIONS}
                                placeholder="Select farmer(s)…"
                            />
                        </Field>
                    </div>
                </form>

                <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
                    <Button variant="outline" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={submit}>
                        {mode === "add" ? "Add Manager" : "Save Changes"}
                    </Button>
                </div>
            </div>
        </div>
    );
}