import { createFileRoute } from "@tanstack/react-router";
import { useAppData } from "@/hooks/use-app-data";
import { PageLoader } from "@/routes/_authenticated/dashboard";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { TrendingUp, Flame, Trophy, BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Synapse" }] }),
  component: Analytics,
});

function Analytics() {
  const { courses, me } = useAppData();
  if (!courses.data || !me.data) return <PageLoader />;

  const byCat: Record<string, number> = {};
  courses.data.forEach((c) => { byCat[c.category] = (byCat[c.category] ?? 0) + c.students; });
  const popData = Object.entries(byCat).map(([category, students]) => ({ category, students: Math.round(students / 1000) }));

  const trending = [...courses.data].sort((a, b) => b.rating * Math.log10(b.students + 10) - a.rating * Math.log10(a.students + 10)).slice(0, 5);

  const completed = me.data.enrollments?.filter((e) => e.completed).length ?? 0;
  const active = me.data.enrollments?.filter((e) => !e.completed).length ?? 0;
  const xp = me.data.profile?.xp ?? 0;
  const streak = me.data.profile?.learning_streak ?? 0;
  const goalProgress = [{ name: "Mastery", value: Math.min(100, completed * 12), fill: "oklch(0.83 0.17 195)" }];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <h1 className="font-display text-4xl">Learning analytics</h1>
      <p className="text-muted-foreground mt-1">Trends, mastery, and platform-wide signals.</p>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={<Flame className="size-4" />} label="Day streak" value={streak} accent="var(--chart-4)" />
        <Kpi icon={<Trophy className="size-4" />} label="Total XP" value={xp} accent="var(--chart-2)" />
        <Kpi icon={<BookOpen className="size-4" />} label="Active courses" value={active} accent="var(--chart-1)" />
        <Kpi icon={<TrendingUp className="size-4" />} label="Completed" value={completed} accent="var(--chart-3)" />
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <div className="card-elevated p-6 lg:col-span-2">
          <div className="font-display text-lg mb-4">Course popularity by domain (k learners)</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={popData}>
              <CartesianGrid stroke="oklch(0.3 0.04 265 / 0.4)" strokeDasharray="3 3" />
              <XAxis dataKey="category" stroke="oklch(0.72 0.03 255)" fontSize={11} />
              <YAxis stroke="oklch(0.72 0.03 255)" fontSize={11} />
              <Tooltip contentStyle={{ background: "oklch(0.21 0.04 265)", border: "1px solid oklch(0.32 0.04 265)", borderRadius: 12 }} />
              <Bar dataKey="students" fill="oklch(0.83 0.17 195)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-elevated p-6">
          <div className="font-display text-lg mb-4">Your mastery</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={goalProgress} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background dataKey="value" cornerRadius={20} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="text-center -mt-32 mb-32">
            <div className="font-display text-3xl gradient-text">{Math.min(100, completed * 12)}%</div>
            <div className="text-xs text-muted-foreground">toward your goal</div>
          </div>
        </div>
      </div>

      <div className="mt-6 card-elevated p-6">
        <div className="font-display text-lg mb-4">🔥 Trending right now</div>
        <div className="space-y-3">
          {trending.map((c, i) => (
            <div key={c.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-surface-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-8 rounded-lg grid place-items-center font-display text-sm" style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}>{i + 1}</div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.category} · {c.instructor}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground tabular-nums">{Intl.NumberFormat("en", { notation: "compact" }).format(c.students)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number | string; accent: string }) {
  return (
    <div className="card-elevated p-5 relative overflow-hidden">
      <div className="absolute -right-6 -top-6 size-20 rounded-full opacity-30 blur-2xl" style={{ background: accent }} />
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1">{icon} {label}</div>
      <div className="font-display text-3xl mt-2">{value}</div>
    </div>
  );
}
