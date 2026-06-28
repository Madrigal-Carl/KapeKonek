import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Coffee, Menu } from "lucide-react";
import { Sidebar } from "@/components/dashboard";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center bg-accent text-primary-foreground">
              <Coffee className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight text-foreground">
              KapeKonek
            </span>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="p-2 text-foreground hover:bg-muted"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>
        <main className="min-w-0 flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
      <Sidebar open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
