export type Course = {
  id: string;
  title: string;
  category: string;
  instructor: string;
  rating: number;
  students: number;
  duration_hours: number;
  difficulty: "beginner" | "intermediate" | "advanced" | string;
  skills: string[];
  description: string;
  thumbnail_hue: number;
};

export const INTERESTS = [
  { id: "AI", label: "AI & ML", emoji: "🤖", hue: 285 },
  { id: "Web Development", label: "Web Development", emoji: "🌐", hue: 200 },
  { id: "Data Science", label: "Data Science", emoji: "📊", hue: 145 },
  { id: "Cyber Security", label: "Cyber Security", emoji: "🛡️", hue: 10 },
  { id: "Cloud Computing", label: "Cloud Computing", emoji: "☁️", hue: 60 },
] as const;

export const CAREER_GOALS = [
  { id: "data-scientist", label: "Data Scientist", skills: ["python","sql","pandas","numpy","machine-learning","statistics","scikit-learn"] },
  { id: "ai-engineer", label: "AI Engineer", skills: ["python","pytorch","deep-learning","llm","rag","mlops","prompt-engineering"] },
  { id: "fullstack-dev", label: "Full Stack Developer", skills: ["javascript","typescript","react","nextjs","nodejs","postgres","tailwindcss"] },
  { id: "cybersecurity-analyst", label: "Cybersecurity Analyst", skills: ["security","networking","linux","penetration-testing","soc","siem","incident-response"] },
  { id: "cloud-architect", label: "Cloud Architect", skills: ["aws","cloud","kubernetes","terraform","docker","networking","architecture"] },
] as const;

export type CareerGoalId = (typeof CAREER_GOALS)[number]["id"];

/* -------- Recommendation engine (content-based + collaborative-ish) ------- */

function tokens(c: Course): string[] {
  return [
    c.category.toLowerCase(),
    c.difficulty.toLowerCase(),
    ...c.skills.map((s) => s.toLowerCase()),
    ...c.title.toLowerCase().split(/\W+/).filter(Boolean),
  ];
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  a.forEach((t) => b.has(t) && inter++);
  return inter / (a.size + b.size - inter);
}

export function recommend(
  courses: Course[],
  ctx: {
    interests: string[];
    enrolledIds: Set<string>;
    completedSkills: Set<string>;
    careerSkills?: string[];
  },
  limit = 12,
): Course[] {
  const interestSet = new Set(ctx.interests.map((i) => i.toLowerCase()));
  const careerSet = new Set((ctx.careerSkills ?? []).map((s) => s.toLowerCase()));

  return courses
    .filter((c) => !ctx.enrolledIds.has(c.id))
    .map((c) => {
      const t = new Set(tokens(c));
      const interestScore = interestSet.has(c.category.toLowerCase()) ? 1 : 0;
      const careerScore = jaccard(t, careerSet);
      const skillNovelty = c.skills.filter((s) => !ctx.completedSkills.has(s.toLowerCase())).length / Math.max(c.skills.length, 1);
      const popularity = Math.log10(c.students + 10) / 6; // 0..~1
      const ratingBoost = (c.rating - 4) / 1; // ~0..1
      const score =
        2.0 * interestScore +
        2.5 * careerScore +
        1.2 * skillNovelty +
        0.8 * popularity +
        0.6 * ratingBoost;
      return { c, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.c);
}

export function similarCourses(courses: Course[], target: Course, limit = 6): Course[] {
  const t = new Set(tokens(target));
  return courses
    .filter((c) => c.id !== target.id)
    .map((c) => ({ c, s: jaccard(t, new Set(tokens(c))) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.c);
}

export function buildLearningPath(courses: Course[], careerId: CareerGoalId): Course[] {
  const goal = CAREER_GOALS.find((g) => g.id === careerId);
  if (!goal) return [];
  const skillSet = new Set(goal.skills.map((s) => s.toLowerCase()));
  const ranked = courses
    .map((c) => {
      const overlap = c.skills.filter((s) => skillSet.has(s.toLowerCase())).length;
      return { c, overlap };
    })
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap);

  const diffOrder = { beginner: 0, intermediate: 1, advanced: 2 } as const;
  const pick = (lvl: keyof typeof diffOrder, n: number) =>
    ranked.filter((x) => x.c.difficulty === lvl).slice(0, n).map((x) => x.c);
  return [...pick("beginner", 2), ...pick("intermediate", 3), ...pick("advanced", 2)];
}

export function skillGap(
  courses: Course[],
  ctx: { completedSkills: Set<string>; careerId: CareerGoalId },
): { have: string[]; missing: string[]; recommended: Course[] } {
  const goal = CAREER_GOALS.find((g) => g.id === ctx.careerId)!;
  const have: string[] = [];
  const missing: string[] = [];
  for (const s of goal.skills) {
    if (ctx.completedSkills.has(s.toLowerCase())) have.push(s);
    else missing.push(s);
  }
  const missingSet = new Set(missing.map((s) => s.toLowerCase()));
  const recommended = courses
    .map((c) => ({ c, m: c.skills.filter((s) => missingSet.has(s.toLowerCase())).length }))
    .filter((x) => x.m > 0)
    .sort((a, b) => b.m - a.m)
    .slice(0, 6)
    .map((x) => x.c);
  return { have, missing, recommended };
}
