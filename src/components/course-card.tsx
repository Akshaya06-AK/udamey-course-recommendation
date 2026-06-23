import { Link } from "@tanstack/react-router";
import { Star, Users, Clock, Sparkles } from "lucide-react";
import type { Course } from "@/lib/recommend";
import { cn } from "@/lib/utils";

export function CourseCard({ course, compact = false }: { course: Course; compact?: boolean }) {
  return (
    <Link
      to="/courses/$courseId"
      params={{ courseId: course.id }}
      className={cn(
        "group relative flex flex-col card-elevated overflow-hidden hover:-translate-y-0.5 transition-transform",
      )}
    >
      <div
        className="h-28 relative"
        style={{
          background: `linear-gradient(135deg, oklch(0.55 0.18 ${course.thumbnail_hue}), oklch(0.35 0.12 ${(course.thumbnail_hue + 60) % 360}))`,
        }}
      >
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, white 0, transparent 40%)" }} />
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] uppercase tracking-widest">
          <span className="rounded-full px-2 py-0.5 bg-background/40 backdrop-blur">{course.category}</span>
          <span className="rounded-full px-2 py-0.5 bg-background/40 backdrop-blur">{course.difficulty}</span>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-display font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        {!compact && (
          <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
        )}
        <div className="text-xs text-muted-foreground">{course.instructor}</div>
        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground pt-2">
          <span className="inline-flex items-center gap-1 text-warning">
            <Star className="size-3 fill-current" />
            {course.rating.toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3" />
            {Intl.NumberFormat("en", { notation: "compact" }).format(course.students)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {course.duration_hours}h
          </span>
        </div>
        {!compact && course.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {course.skills.slice(0, 3).map((s) => (
              <span key={s} className="rounded-full bg-accent/60 text-[10px] px-2 py-0.5 text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export function RecommendationReason({ reason }: { reason: string }) {
  return (
    <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-primary">
      <Sparkles className="size-3" /> {reason}
    </div>
  );
}
