import { createFileRoute } from "@tanstack/react-router";
import { useAppData } from "@/hooks/use-app-data";
import { skillGap, CAREER_GOALS } from "@/lib/recommend";
import { CourseCard } from "@/components/course-card";
import { PageLoader } from "@/routes/_authenticated/dashboard";
import { Check, X, Target } from "lucide-react";

export const Route = createFileRoute("/_authenticated/skill-gap")({
  head: () => ({ meta: [{ title: "Skill Gap — Synapse" }] }),
  component: GapPage,
});

function GapPage() {
  const { courses, me } = useAppData();
  if (!courses.data || !me.data) return <PageLoader />;
  const goal = CAREER_GOALS.find((g) => g.id === me.data.profile?.career_goal);
  if (!goal) return <div className="p-10">Set a career goal first.</div>;

  const completedSkills = new Set<string>();
  courses.data.forEach((c) => {
    if ((me.data!.enrollments ?? []).find((e) => e.course_id === c.id && e.completed))
      c.skills.forEach((s) => completedSkills.add(s.toLowerCase()));
  });

  const { have, missing, recommended } = skillGap(courses.data, { completedSkills, careerId: goal.id });
  const total = have.length + missing.length;
  const pct = total ? Math.round((have.length / total) * 100) : 0;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="text-xs uppercase tracking-widest text-primary inline-flex items-center gap-1">
        <Target className="size-3" /> Gap analysis
      </div>
      <h1 className="font-display text-4xl mt-1">{goal.label} readiness</h1>

      <div className="mt-6 card-elevated p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">You have <span className="text-foreground font-medium">{have.length}</span> of {total} key skills</span>
          <span className="font-display text-2xl gradient-text">{pct}%</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-surface-2 overflow-hidden">
          <div className="h-full" style={{ width: `${pct}%`, background: "var(--gradient-primary)" }} />
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="card-elevated p-6">
          <div className="text-xs uppercase tracking-widest text-success mb-3">You've got</div>
          <div className="flex flex-wrap gap-2">
            {have.length === 0 ? <div className="text-sm text-muted-foreground">No completed skills yet.</div> :
              have.map((s) => <span key={s} className="rounded-full bg-success/15 text-success text-xs px-3 py-1 inline-flex items-center gap-1"><Check className="size-3" /> {s}</span>)}
          </div>
        </div>
        <div className="card-elevated p-6">
          <div className="text-xs uppercase tracking-widest text-destructive mb-3">Missing</div>
          <div className="flex flex-wrap gap-2">
            {missing.map((s) => <span key={s} className="rounded-full bg-destructive/15 text-destructive text-xs px-3 py-1 inline-flex items-center gap-1"><X className="size-3" /> {s}</span>)}
          </div>
        </div>
      </div>

      <h2 className="font-display text-xl mt-10 mb-4">Close the gap with these</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommended.map((c) => <CourseCard key={c.id} course={c} />)}
      </div>
    </div>
  );
}
