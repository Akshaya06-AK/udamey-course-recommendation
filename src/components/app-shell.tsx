import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Sparkles, BookOpen, Target, Route as RouteIcon, BarChart3, Bot, LogOut, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/recommendations", label: "For You", icon: Sparkles },
  { to: "/courses", label: "Catalog", icon: BookOpen },
  { to: "/learning-path", label: "Learning Path", icon: RouteIcon },
  { to: "/skill-gap", label: "Skill Gap", icon: Target },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/assistant", label: "AI Assistant", icon: Bot },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-64 shrink-0 flex-col glass border-r border-border p-4 sticky top-0 h-screen">
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-3">
          <div className="size-9 rounded-xl grid place-items-center" style={{ background: "var(--gradient-primary)" }}>
            <Brain className="size-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display text-lg font-semibold leading-none">Synapse</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Learning OS</div>
          </div>
        </Link>
        <nav className="mt-6 flex flex-col gap-1">
          {nav.map((item) => {
            const active = pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent text-foreground glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
