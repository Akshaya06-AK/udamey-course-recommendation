import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, Sparkles, Target, BarChart3, Bot, Wand2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Synapse — AI-Powered Course Recommendations" },
      { name: "description", content: "Personalized learning paths, skill gap analysis, and an AI tutor that maps your career — all in one place." },
      { property: "og:title", content: "Synapse — AI-Powered Course Recommendations" },
      { property: "og:description", content: "Personalized learning paths, skill gap analysis, and an AI tutor." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-xl grid place-items-center" style={{ background: "var(--gradient-primary)" }}>
            <Brain className="size-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold">Synapse</span>
        </div>
        <Link to="/auth" className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:opacity-90">
          Get started
        </Link>
      </header>

      <section className="container mx-auto px-6 pt-12 pb-24 text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground mb-6">
          <Sparkles className="size-3 text-primary" /> Powered by Lovable AI
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[1.05]">
          The smartest way to <span className="gradient-text">learn what matters</span>.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Synapse builds a personalized learning operating system — recommendations, roadmaps, skill gap analysis,
          and an always-on AI coach — so you stop browsing and start growing.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link to="/auth" className="rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90 inline-flex items-center gap-2 glow">
            Start learning <ArrowRight className="size-4" />
          </Link>
          <a href="#features" className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-accent">
            See features
          </a>
        </div>

        <div className="mt-16 relative">
          <div className="absolute inset-0 -z-10 blur-3xl opacity-50" style={{ background: "var(--gradient-aurora)" }} />
          <div className="mx-auto max-w-3xl rounded-3xl card-elevated p-6 text-left">
            <div className="text-xs uppercase tracking-widest text-primary">Your weekly mission</div>
            <div className="mt-2 font-display text-2xl">Become an AI Engineer in 14 weeks</div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {["Python Foundations", "Deep Learning w/ PyTorch", "LLM Engineering"].map((t, i) => (
                <div key={t} className="rounded-2xl bg-surface-2 p-3 text-sm">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Phase {i + 1}</div>
                  <div className="mt-1 font-medium">{t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="container mx-auto px-6 pb-24 grid md:grid-cols-3 gap-5">
        {[
          { icon: Sparkles, title: "Hybrid Recommendations", body: "Content-based + collaborative + popularity ranking, tuned to your interests, history and goals." },
          { icon: Target, title: "Skill Gap Analysis", body: "Compare what you know to what your target role needs — and get an exact playlist to close the gap." },
          { icon: Wand2, title: "Auto Learning Path", body: "Beginner → Intermediate → Advanced, automatically sequenced for your career." },
          { icon: Bot, title: "AI Learning Coach", body: "Ask 'what next?' anytime. Get timelines, project ideas and curriculum advice." },
          { icon: BarChart3, title: "Progress Analytics", body: "Streaks, XP, mastery charts and trending courses across the platform." },
          { icon: Brain, title: "Resume-aware", body: "Drop your resume in chat — Synapse extracts skills and recommends what to learn next." },
        ].map((f) => (
          <div key={f.title} className="card-elevated p-6">
            <div className="size-10 rounded-xl grid place-items-center mb-4" style={{ background: "var(--gradient-primary)" }}>
              <f.icon className="size-5 text-primary-foreground" />
            </div>
            <div className="font-display text-lg font-semibold">{f.title}</div>
            <p className="text-sm text-muted-foreground mt-2">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Synapse · Built with Lovable Cloud + Lovable AI
      </footer>
    </div>
  );
}
