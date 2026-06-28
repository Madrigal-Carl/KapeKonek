import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingBag,
  Coffee,
  User,
  Package,
  Settings,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import useAuth from "@/hooks/useAuth";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Products" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { count, setOpen: setCartOpen } = useCart();
  const { isAuthenticated, role, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    setOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background backdrop-blur">
      <div className="kk-container flex h-16 items-center justify-between gap-6">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="grid h-8 w-8 place-items-center bg-[var(--color-accent)] text-background">
            <Coffee size={16} strokeWidth={2.4} />
          </span>
          <span className="text-base font-bold tracking-tight">KapeKonek</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="label-mono text-foreground transition-colors hover:text-[var(--color-accent)]"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative grid h-10 w-10 place-items-center border border-border bg-background transition-colors hover:bg-[var(--color-neutral-warm)]"
            aria-label={`Cart, ${count} items`}
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center bg-[var(--color-accent)] px-1 text-[10px] font-bold text-[var(--color-accent-foreground)]">
                {count}
              </span>
            )}
          </button>

          {!isAuthenticated && (
            <Link
              to="/login"
              className="label-mono hidden border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 py-2.5 text-[var(--color-accent-foreground)] transition-colors hover:bg-foreground hover:border-foreground hover:text-background sm:inline-block"
            >
              Login
            </Link>
          )}

          {isAuthenticated && role !== "buyer" && (
            <Link
              to={`/${role}/overview`}
              className="label-mono inline-flex items-center gap-2 border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 py-2.5 text-[var(--color-accent-foreground)] transition-colors hover:bg-foreground hover:border-foreground hover:text-background"
            >
              <LayoutDashboard size={14} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          )}

          {isAuthenticated && role === "buyer" && (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((p) => !p)}
                className="grid h-10 w-10 place-items-center border border-border bg-background transition-colors hover:bg-[var(--color-neutral-warm)]"
                aria-label="Account menu"
                aria-expanded={profileOpen}
              >
                <User size={18} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 border border-border bg-background shadow-sm">
                  <Link
                    to="/orders"
                    onClick={() => setProfileOpen(false)}
                    className="label-mono flex items-center gap-2.5 border-b border-border px-4 py-3 text-foreground transition-colors hover:bg-[var(--color-neutral-warm)]"
                  >
                    <Package size={14} />
                    Orders
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="label-mono flex items-center gap-2.5 border-b border-border px-4 py-3 text-foreground transition-colors hover:bg-[var(--color-neutral-warm)]"
                  >
                    <Settings size={14} />
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="label-mono flex w-full items-center gap-2.5 px-4 py-3 text-left text-foreground transition-colors hover:bg-[var(--color-neutral-warm)]"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className="grid h-10 w-10 place-items-center border border-border md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="kk-container flex flex-col py-4">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="label-mono border-b border-border last:border-none py-4 text-foreground"
              >
                {n.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="label-mono mt-4 bg-foreground px-4 py-3 text-center text-background"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
