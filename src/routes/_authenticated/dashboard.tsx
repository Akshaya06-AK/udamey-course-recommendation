import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAppData } from "@/hooks/use-app-data";
import { useEffect, useMemo } from "react";
import { recommend, buildLearningPath, CAREER_GOALS, type Course } from "@/lib/recommend";
import { CourseCard } from "@/components/course-card";
import { Flame, Trophy, Sparkles, ArrowRight, Target } from "lucide-react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Synapse" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { courses, me } = useAppData();
  const navigate = useNavigate();

  useEffect(() => {
    if (me.data && me.data.profile && !me.data.profile.onboarded) {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [me.data, navigate]);

  const ctx = useMemo(() => {
    if (!me.data || !courses.data) return null;
    const enrolledIds = new Set((me.data.enrollments ?? []).map((e) => e.course_id));
    const completedCourses = (me.data.enrollments ?? []).filter((e) => e.completed);
    const completedSkills = new Set<string>();
    courses.data.forEach((c) => {
      if (completedCourses.find((e) => e.course_id === c.id)) c.skills.forEach((s) => completedSkills.add(s.toLowerCase()));
    });
    const goal = CAREER_GOALS.find((g) => g.id === me.data!.profile?.career_goal);
    return {
      interests: (me.data.interests ?? []).map((i) => i.category),
      enrolledIds,
      completedSkills,
      careerSkills: goal?.skills as string[] | undefined,
      goal,
    };
  }, [me.data, courses.data]);

  if (!courses.data || !me.data) return <PageLoader />;
  if (!ctx) return null;

  const recs = recommend(courses.data, ctx, 8);
  const path = ctx.goal ? buildLearningPath(courses.data, ctx.goal.id) : [];
  const inProgress = (me.data.enrollments ?? []).filter((e) => !e.completed);
  const completed = (me.data.enrollments ?? []).filter((e) => e.completed).length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary inline-flex items-center gap-1">
            <Sparkles className="size-3" /> Personalized for you
          </div>
          <h1 className="font-display text-4xl mt-1">
            Hi {me.data.profile?.display_name?.split(" ")[0] ?? "there"} 👋
          </h1>
          {ctx.goal && (
            <p className="text-muted-foreground mt-1">
              Tracking: <span className="text-foreground">{ctx.goal.label}</span>
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Stat icon={<Flame className="size-4" />} label="Streak" value={`${me.data.profile?.learning_streak ?? 0}d`} />
          <Stat icon={<Trophy className="size-4" />} label="XP" value={`${me.data.profile?.xp ?? 0}`} />
          <Stat icon={<Target className="size-4" />} label="Completed" value={`${completed}`} />
        </div>
      </div>

      {inProgress.length > 0 && (
        <Section title="Continue learning">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {inProgress.map((e) => {
              const c = courses.data!.find((x) => x.id === e.course_id);
              if (!c) return null;
              return (
                <div key={c.id} className="card-elevated p-4">
                  <div className="text-xs text-muted-foreground">{c.category}</div>
                  <div className="font-display text-base font-semibold mt-1 line-clamp-2">{c.title}</div>
                  <div className="mt-3 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${e.progress}%` }} />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">{e.progress}% complete</div>
                  <Link to="/courses/$courseId" params={{ courseId: c.id }} className="mt-3 text-xs text-primary inline-flex items-center gap-1">
                    Resume <ArrowRight className="size-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      <Section title="Recommended for you" cta={{ to: "/recommendations", label: "See all" }}>
        <CourseGrid items={recs} />
      </Section>

      {path.length > 0 && (
        <Section title={`Your ${ctx.goal!.label} path`} cta={{ to: "/learning-path", label: "Open path" }}>
          <CourseGrid items={path.slice(0, 4)} />
        </Section>
      )}
    </div>
  );
}

function Section({ title, children, cta }: { title: string; children: React.ReactNode; cta?: { to: string; label: string } }) {
  return (
    <section className="mt-10">
      <div className="flex items-end justify-between mb-4">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {cta && (
          <Link to={cta.to as never} className="text-xs text-primary inline-flex items-center gap-1">
            {cta.label} <ArrowRight className="size-3" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function CourseGrid({ items }: { items: Course[] }) {
  if (items.length === 0) return <div className="text-sm text-muted-foreground">Nothing here yet.</div>;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((c) => <CourseCard key={c.id} course={c} />)}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card-elevated px-4 py-3 min-w-[110px]">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1">{icon} {label}</div>
      <div className="font-display text-xl mt-1">{value}</div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] grid place-items-center text-muted-foreground">
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}
