import { createFileRoute } from "@tanstack/react-router";
import { useAppData } from "@/hooks/use-app-data";
import { buildLearningPath, CAREER_GOALS } from "@/lib/recommend";
import { CourseCard } from "@/components/course-card";
import { PageLoader } from "@/routes/_authenticated/dashboard";
import { Route as RouteIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/learning-path")({
  head: () => ({ meta: [{ title: "Learning Path — Synapse" }] }),
  component: PathPage,
});

function PathPage() {
  const { courses, me } = useAppData();
  if (!courses.data || !me.data) return <PageLoader />;
  const goal = CAREER_GOALS.find((g) => g.id === me.data.profile?.career_goal);
  if (!goal) return <div className="p-10">Set a career goal in onboarding first.</div>;
  const path = buildLearningPath(courses.data, goal.id);
  const phases = [
    { label: "Beginner", level: "beginner", color: "var(--chart-1)" },
    { label: "Intermediate", level: "intermediate", color: "var(--chart-2)" },
    { label: "Advanced", level: "advanced", color: "var(--chart-3)" },
  ];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="text-xs uppercase tracking-widest text-primary inline-flex items-center gap-1">
        <RouteIcon className="size-3" /> Auto-generated roadmap
      </div>
      <h1 className="font-display text-4xl mt-1">Become a {goal.label}</h1>
      <p className="text-muted-foreground mt-1">Sequenced from foundations to advanced specialization.</p>

      <div className="mt-10 space-y-10">
        {phases.map((phase, idx) => {
          const items = path.filter((c) => c.difficulty === phase.level);
          if (!items.length) return null;
          return (
            <div key={phase.label} className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-9 rounded-full grid place-items-center font-display text-sm" style={{ background: phase.color, color: "var(--primary-foreground)" }}>{idx + 1}</div>
                <div>
                  <div className="font-display text-xl">{phase.label}</div>
                  <div className="text-xs text-muted-foreground">{items.length} courses · ~{items.reduce((a, c) => a + c.duration_hours, 0)}h</div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-12">
                {items.map((c) => <CourseCard key={c.id} course={c} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
