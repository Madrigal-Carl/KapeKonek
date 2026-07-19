import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown, FileText, Upload, X } from "lucide-react";
import { PageHeader } from "@/components/dashboard";
import { Button } from "@/components/ui";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";

const ASSOCIATIONS = [
  "Benguet Coffee Growers Association",
  "Cordillera Highland Coffee Cooperative",
  "Sagada Arabica Farmers Guild",
  "Bukidnon Robusta Producers",
  "Mountain Province Coffee Alliance",
  "Cavite Liberica Federation",
  "Sulu Excelsa Growers Network",
  "Davao Coffee Council",
];

// --- Inline UI primitives (no @/components/ui dependency) -------------------

const TabsCtx = createContext(null);
function Tabs({ value, defaultValue, onValueChange, className, children }) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  const setCurrent = (v) => {
    setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsCtx.Provider value={{ current, setCurrent }}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
}
function TabsList({ className, children }) {
  return (
    <div
      className={[
        "inline-flex items-center gap-1 border-b border-border",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
function TabsTrigger({ value, children }) {
  const ctx = useContext(TabsCtx);
  const active = ctx?.current === value;
  return (
    <button
      type="button"
      onClick={() => ctx?.setCurrent(value)}
      className={[
        "px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2",
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
function TabsContent({ value, children }) {
  const ctx = useContext(TabsCtx);
  if (ctx?.current !== value) return null;
  return <div>{children}</div>;
}

function Label({ htmlFor, children, className }) {
  return (
    <label
      htmlFor={htmlFor}
      className={["text-sm font-medium text-foreground", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </label>
  );
}
function Input({ className, ...props }) {
  return (
    <input
      {...props}
      className={[
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:border-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

// ---------------------------------------------------------------------------

export function SettingsPage() {
  const { role } = useAuth();
  const isFarmer = role === ROLES.FARMER;

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your profile and organization details."
      />
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {isFarmer && (
            <TabsTrigger value="organization">Organization</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        {isFarmer && (
          <TabsContent value="organization">
            <OrganizationTab />
          </TabsContent>
        )}
      </Tabs>
    </>
  );
}

function ProfileTab() {
  const [fullName, setFullName] = useState("Juan Dela Cruz");
  const [email, setEmail] = useState("juan@kapekonek.ph");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  function handleSubmit(e) {
    e.preventDefault();
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="border border-border bg-card p-6 md:p-8 space-y-8"
    >
      <section className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Personal information
            </h2>
            <p className="text-sm text-muted-foreground">
              Update your name and contact email.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <Check className="h-3.5 w-3.5" />
            Verified
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
        </div>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Password</h2>
          <p className="text-sm text-muted-foreground">
            Use a strong password you don't reuse elsewhere.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  );
}

function OrganizationTab() {
  const [association, setAssociation] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const comboRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (comboRef.current && !comboRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const filtered = ASSOCIATIONS.filter((a) =>
    a.toLowerCase().includes(query.toLowerCase()),
  );
  function addFiles(list) {
    if (!list) return;
    const next = Array.from(list).map((f) => ({
      id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 8)}`,
      name: f.name,
      size: f.size,
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...next]);
    next.forEach((file) => simulateUpload(file.id));
  }
  function simulateUpload(id) {
    const interval = setInterval(() => {
      setFiles((prev) => {
        let done = false;
        const updated = prev.map((f) => {
          if (f.id !== id) return f;
          const next = Math.min(100, f.progress + Math.random() * 18 + 6);
          if (next >= 100) done = true;
          return { ...f, progress: next };
        });
        if (done) clearInterval(interval);
        return updated;
      });
    }, 250);
  }
  function handleFileChange(e) {
    addFiles(e.target.files);
    e.target.value = "";
  }
  function removeFile(id) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }
  function handleSubmit(e) {
    e.preventDefault();
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="border border-border bg-card p-6 md:p-8 space-y-8"
    >
      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Association</h2>
          <p className="text-sm text-muted-foreground">
            Select the cooperative or association you belong to.
          </p>
        </div>
        <div className="space-y-2 relative w-full" ref={comboRef}>
          <Label>Association</Label>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm hover:bg-accent/40 transition-colors"
          >
            <span
              className={[!association && "text-muted-foreground"]
                .filter(Boolean)
                .join(" ")}
            >
              {association || "Select association..."}
            </span>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </button>
          {open && (
            <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
              <div className="border-b border-border p-2">
                <Input
                  autoFocus
                  placeholder="Search associations..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-9"
                />
              </div>
              <ul className="max-h-60 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-muted-foreground">
                    No associations found.
                  </li>
                ) : (
                  filtered.map((a) => {
                    const selected = a === association;
                    return (
                      <li key={a}>
                        <button
                          type="button"
                          onClick={() => {
                            setAssociation(a);
                            setOpen(false);
                            setQuery("");
                          }}
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent/60"
                        >
                          <span>{a}</span>
                          {selected && (
                            <Check className="h-4 w-4 text-accent" />
                          )}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          )}
        </div>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Requirements
          </h2>
          <p className="text-sm text-muted-foreground">
            Upload supporting documents: barangay certification, association ID,
            farm ownership proof, or other requirements.
          </p>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            addFiles(e.dataTransfer.files);
          }}
          className={[
            "flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border px-6 py-10 text-center transition-colors",
            dragOver && "border-accent bg-accent/10",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="rounded-full bg-muted p-3">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-sm text-foreground">
            Drag and drop files here, or
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Browse files
          </Button>
          <p className="text-xs text-muted-foreground">
            PDF, JPG, or PNG up to 10MB each
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {files.length > 0 && (
          <ul className="divide-y divide-border rounded-md border border-border">
            {files.map((f) => {
              const done = f.progress >= 100;
              return (
                <li key={f.id} className="flex items-center gap-3 px-4 py-3">
                  <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm text-foreground">
                        {f.name}
                      </p>
                      <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {done
                          ? formatBytes(f.size)
                          : `${Math.round(f.progress)}%`}
                      </p>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={[
                          "h-full transition-all duration-200",
                          done ? "bg-emerald-600" : "bg-accent",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        style={{ width: `${f.progress}%` }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(f.id)}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label={`Remove ${f.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="flex justify-end gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">Save organization</Button>
      </div>
    </form>
  );
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
