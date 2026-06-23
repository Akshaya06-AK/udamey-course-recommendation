import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppData } from "@/hooks/use-app-data";
import { CourseCard } from "@/components/course-card";
import { PageLoader } from "@/routes/_authenticated/dashboard";
import { similarCourses } from "@/lib/recommend";
import { Star, Users, Clock, ArrowLeft, Check, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { enrollCourse, updateProgress } from "@/lib/api.functions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/courses/$courseId")({
  head: () => ({ meta: [{ title: "Course — Synapse" }] }),
  component: CourseDetail,
});

function CourseDetail() {
  const { courseId } = Route.useParams();
  const { courses, me } = useAppData();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const enroll = useServerFn(enrollCourse);
  const progress = useServerFn(updateProgress);

  const enrollMut = useMutation({
    mutationFn: () => enroll({ data: { courseId } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["me"] }); toast.success("Enrolled!"); },
  });
  const progMut = useMutation({
    mutationFn: (p: number) => progress({ data: { courseId, progress: p } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["me"] }); },
  });

  if (!courses.data || !me.data) return <PageLoader />;
  const course = courses.data.find((c) => c.id === courseId);
  if (!course) return <div className="p-10">Course not found.</div>;
  const enrollment = me.data.enrollments?.find((e) => e.course_id === courseId);
  const similar = similarCourses(courses.data, course, 6);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <button onClick={() => navigate({ to: "/courses" })} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-6">
        <ArrowLeft className="size-3" /> Back to catalog
      </button>

      <div className="grid md:grid-cols-[1.5fr_1fr] gap-6">
        <div>
          <div
            className="rounded-3xl h-56 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, oklch(0.55 0.18 ${course.thumbnail_hue}), oklch(0.35 0.12 ${(course.thumbnail_hue + 60) % 360}))` }}
          >
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, white 0, transparent 40%)" }} />
            <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-[10px] uppercase tracking-widest">
              <span className="rounded-full px-2 py-0.5 bg-background/40 backdrop-blur">{course.category}</span>
              <span className="rounded-full px-2 py-0.5 bg-background/40 backdrop-blur">{course.difficulty}</span>
            </div>
          </div>
          <h1 className="font-display text-3xl md:text-4xl mt-6">{course.title}</h1>
          <div className="mt-2 text-sm text-muted-foreground">By {course.instructor}</div>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1 text-warning"><Star className="size-4 fill-current" /> {course.rating.toFixed(1)}</span>
            <span className="inline-flex items-center gap-1"><Users className="size-4" /> {Intl.NumberFormat("en").format(course.students)} learners</span>
            <span className="inline-flex items-center gap-1"><Clock className="size-4" /> {course.duration_hours}h</span>
          </div>
          <p className="mt-6 text-foreground/90">{course.description}</p>
          <div className="mt-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Skills you'll learn</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {course.skills.map((s) => (
                <span key={s} className="rounded-full bg-accent/60 text-xs px-3 py-1">{s}</span>
              ))}
            </div>
          </div>
        </div>

        <aside className="card-elevated p-6 h-fit md:sticky md:top-6">
          {!enrollment ? (
            <button
              onClick={() => enrollMut.mutate()}
              disabled={enrollMut.isPending}
              className="w-full rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-medium hover:opacity-90 glow inline-flex items-center justify-center gap-2"
            >
              {enrollMut.isPending && <Loader2 className="size-4 animate-spin" />} Enroll for free
            </button>
          ) : (
            <div>
              <div className="text-xs uppercase tracking-widest text-primary mb-2">In progress</div>
              <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${enrollment.progress}%` }} />
              </div>
              <div className="text-xs text-muted-foreground mt-2">{enrollment.progress}% complete</div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[25, 50, 100].map((p) => (
                  <button key={p} onClick={() => progMut.mutate(p)} className="rounded-lg bg-surface-2 hover:bg-accent text-xs py-2">
                    {p === 100 ? "Done" : `${p}%`}
                  </button>
                ))}
              </div>
              {enrollment.completed && (
                <div className="mt-4 inline-flex items-center gap-1 text-xs text-success"><Check className="size-3" /> Completed</div>
              )}
            </div>
          )}
        </aside>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl mb-4">Similar courses</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {similar.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      </section>
    </div>
  );
}
