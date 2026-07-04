import { Link, useLocation, useNavigate } from "react-router-dom";
import { Coffee, LogOut, X } from "lucide-react";
import { useState } from "react";
import { getNavSectionsForRole } from "@/constants/navigation";
import { Button } from "@/components/ui";
import useAuth from "@/hooks/useAuth";

export function Sidebar({ open, onClose }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navSections = getNavSectionsForRole(user?.role);

  const isActive = (to, exact) =>
    to
      ? exact
        ? pathname === to
        : pathname === to || pathname.startsWith(to + "/")
      : false;

  async function handleLogoutConfirm() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setLogoutOpen(false);
      onClose();
      navigate("/login", { replace: true });
    }
  }

  const renderItem = (item) => {
    const Icon = item.icon;
    const active = isActive(item.to, item.exact);

    if (item.action === "logout") {
      return (
        <li key={item.label}>
          <button
            onClick={() => setLogoutOpen(true)}
            className="relative flex w-full items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-neutral-warm/60 hover:text-foreground"
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </button>
        </li>
      );
    }

    const to = item.to ?? "/";
    return (
      <li key={to}>
        <Link
          to={to}
          onClick={onClose}
          className={`relative flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${active ? "bg-neutral-warm text-foreground font-medium" : "text-muted-foreground hover:bg-neutral-warm/60 hover:text-foreground"}`}
        >
          {active && (
            <span className="absolute left-0 top-0 h-full w-0.5 bg-accent" />
          )}
          <Icon className="h-4 w-4" />
          <span className="flex-1">{item.label}</span>
          {item.badge ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-semibold text-primary-foreground">
              {item.badge}
            </span>
          ) : null}
        </Link>
      </li>
    );
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground-40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:static lg:order-first lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center bg-accent text-primary-foreground">
              <Coffee className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight text-primary">
              KapeKonek
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navSections.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="label-mono px-4 pb-2 text-muted-foreground">
                {group.label}
              </p>
              <ul className="space-y-0.5">{group.items.map(renderItem)}</ul>
            </div>
          ))}
        </nav>
      </aside>

      {logoutOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-40 p-4"
          onClick={() => !loggingOut && setLogoutOpen(false)}
        >
          <div
            className="w-full max-w-md border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-foreground">
              <LogOut className="h-5 w-5 text-muted-foreground" />
              Log out?
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Are you sure you want to log out of KapeKonek? You will need to
              sign in again to access your account.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setLogoutOpen(false)}
                disabled={loggingOut}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogoutConfirm}
                disabled={loggingOut}
              >
                {loggingOut ? "Logging out…" : "Log out"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
