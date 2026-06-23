import { createFileRoute } from "@tanstack/react-router";
import { useAppData } from "@/hooks/use-app-data";
import { recommend, CAREER_GOALS } from "@/lib/recommend";
import { CourseCard } from "@/components/course-card";
import { PageLoader } from "@/routes/_authenticated/dashboard";

export const Route = createFileRoute("/_authenticated/recommendations")({
  head: () => ({ meta: [{ title: "For You — Synapse" }] }),
  component: Recs,
});

function Recs() {
  const { courses, me } = useAppData();
  if (!courses.data || !me.data) return <PageLoader />;
  const enrolledIds = new Set((me.data.enrollments ?? []).map((e) => e.course_id));
  const completedSkills = new Set<string>();
  courses.data.forEach((c) => {
    if ((me.data!.enrollments ?? []).find((e) => e.course_id === c.id && e.completed))
      c.skills.forEach((s) => completedSkills.add(s.toLowerCase()));
  });
  const goal = CAREER_GOALS.find((g) => g.id === me.data.profile?.career_goal);
  const recs = recommend(courses.data, {
    interests: (me.data.interests ?? []).map((i) => i.category),
    enrolledIds, completedSkills, careerSkills: goal?.skills as string[] | undefined,
  }, 24);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="text-xs uppercase tracking-widest text-primary">Hybrid ranking</div>
      <h1 className="font-display text-4xl mt-1">For You</h1>
      <p className="text-muted-foreground mt-1">Content-based + career-aligned + popularity boost.</p>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {recs.map((c) => <CourseCard key={c.id} course={c} />)}
      </div>
    </div>
  );
}
