import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Home" },
  { to: "/people", label: "People" },
  { to: "/log", label: "Log" },
  { to: "/patterns", label: "Patterns" },
  { to: "/criteria", label: "Criteria" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4">
          <Link to="/dashboard" className="font-display text-xl leading-none">
            Inner Circle
          </Link>
          <nav className="flex flex-1 flex-wrap items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-full px-3 py-1.5 text-sm text-ink-soft transition-colors hover:bg-muted"
                activeProps={{ className: "bg-accent text-accent-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <Link
              to="/settings"
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
              activeProps={{ className: "bg-accent text-accent-foreground" }}
            >
              Settings
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-xl text-sm text-ink-soft">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn("panel p-6", className)}>{children}</section>;
}
