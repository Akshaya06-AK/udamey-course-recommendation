import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getCourses = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const c = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
  const { data, error } = await c.from("courses").select("*").order("students", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    const { data: interests } = await context.supabase
      .from("user_interests")
      .select("category, weight")
      .eq("user_id", context.userId);
    const { data: enrollments } = await context.supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", context.userId);
    return {
      profile: profile ?? null,
      interests: interests ?? [],
      enrollments: enrollments ?? [],
    };
  });

export const saveOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { interests: string[]; careerGoal: string; displayName?: string }) => d)
  .handler(async ({ context, data }) => {
    await context.supabase.from("profiles").upsert({
      id: context.userId,
      career_goal: data.careerGoal,
      display_name: data.displayName || null,
      onboarded: true,
      updated_at: new Date().toISOString(),
    });
    await context.supabase.from("user_interests").delete().eq("user_id", context.userId);
    if (data.interests.length) {
      await context.supabase.from("user_interests").insert(
        data.interests.map((c) => ({ user_id: context.userId, category: c })),
      );
    }
    return { ok: true };
  });

export const enrollCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { courseId: string }) => d)
  .handler(async ({ context, data }) => {
    await context.supabase.from("enrollments").upsert({
      user_id: context.userId,
      course_id: data.courseId,
      progress: 0,
    });
    return { ok: true };
  });

export const updateProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { courseId: string; progress: number }) => d)
  .handler(async ({ context, data }) => {
    const completed = data.progress >= 100;
    await context.supabase
      .from("enrollments")
      .update({
        progress: Math.max(0, Math.min(100, Math.round(data.progress))),
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq("user_id", context.userId)
      .eq("course_id", data.courseId);
    if (completed) {
      const { data: profile } = await context.supabase
        .from("profiles").select("xp, learning_streak").eq("id", context.userId).maybeSingle();
      await context.supabase.from("profiles").update({
        xp: (profile?.xp ?? 0) + 100,
        learning_streak: (profile?.learning_streak ?? 0) + 1,
      }).eq("id", context.userId);
    }
    return { ok: true };
  });
