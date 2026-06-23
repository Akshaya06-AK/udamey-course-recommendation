import { createFileRoute } from "@tanstack/react-router";
import { useAppData } from "@/hooks/use-app-data";
import { CourseCard } from "@/components/course-card";
import { PageLoader } from "@/routes/_authenticated/dashboard";
import { useState, useMemo } from "react";
import { INTERESTS } from "@/lib/recommend";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/courses/")({
  head: () => ({ meta: [{ title: "Catalog — Synapse" }] }),
  component: Catalog,
});

function Catalog() {
  const { courses } = useAppData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const filtered = useMemo(() => {
    const list = courses.data ?? [];
    return list.filter((c) => {
      if (cat !== "All" && c.category !== cat) return false;
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return c.title.toLowerCase().includes(needle)
        || c.skills.some((s) => s.toLowerCase().includes(needle))
        || c.description.toLowerCase().includes(needle);
    });
  }, [courses.data, q, cat]);

  if (!courses.data) return <PageLoader />;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <h1 className="font-display text-4xl">Course catalog</h1>
      <p className="text-muted-foreground mt-1">{courses.data.length} courses across {INTERESTS.length} domains.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            placeholder="Search courses, skills, instructors…"
            value={q} onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-xl bg-surface-2 pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/40"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", ...INTERESTS.map((i) => i.id)].map((c) => (
            <button key={c} onClick={() => setCat(c)} className={cn(
              "rounded-full px-3 py-1.5 text-xs border",
              cat === c ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
            )}>{c}</button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((c) => <CourseCard key={c.id} course={c} />)}
      </div>
    </div>
  );
}
