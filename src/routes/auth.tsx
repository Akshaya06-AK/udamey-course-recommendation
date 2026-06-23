import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Brain, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Synapse" },
      { name: "description", content: "Sign in to your personalized AI learning dashboard." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Welcome! Setting up your profile…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/dashboard", replace: true });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { toast.error(result.error.message); return; }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-aurora)" }} />
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-xl grid place-items-center" style={{ background: "var(--gradient-primary)" }}>
            <Brain className="size-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold">Synapse</span>
        </div>
        <div>
          <h1 className="font-display text-4xl font-semibold leading-tight max-w-md">
            Your <span className="gradient-text">AI learning OS</span>. Tailored from day one.
          </h1>
          <p className="mt-4 text-muted-foreground max-w-md">
            Hybrid recommendations, career roadmaps and an AI coach — all in one private workspace.
          </p>
        </div>
        <div className="text-xs text-muted-foreground">© Synapse · AI Course Recommendations</div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm card-elevated p-8">
          <div className="text-xs uppercase tracking-widest text-primary">{mode === "signin" ? "Welcome back" : "Create account"}</div>
          <h2 className="font-display text-2xl mt-1">{mode === "signin" ? "Sign in to Synapse" : "Start learning smarter"}</h2>

          <button
            onClick={google}
            className="mt-6 w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium hover:bg-accent inline-flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="size-4"><path fill="#EA4335" d="M12 11v3.2h8.86C20.4 18 16.7 21 12 21 6.48 21 2 16.52 2 11S6.48 1 12 1c2.7 0 5.16 1.04 7 2.74l-2.3 2.22C15.4 4.84 13.78 4.2 12 4.2 8.13 4.2 5 7.33 5 11s3.13 6.8 7 6.8c3.55 0 5.96-2.04 6.32-4.8H12z"/></svg>
            Continue with Google
          </button>
          <div className="flex items-center gap-3 my-6 text-[10px] uppercase tracking-widest text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> or email <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3">
            {mode === "signup" && (
              <input
                placeholder="Your name"
                value={name} onChange={(e) => setName(e.target.value)}
                className="rounded-xl bg-surface-2 px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/40"
              />
            )}
            <input
              type="email" required placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl bg-surface-2 px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/40"
            />
            <input
              type="password" required minLength={6} placeholder="Password (min 6)"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl bg-surface-2 px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/40"
            />
            <button disabled={loading} className="rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 inline-flex items-center justify-center gap-2 glow disabled:opacity-60">
              {loading && <Loader2 className="size-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-4 text-xs text-muted-foreground hover:text-foreground w-full text-center"
          >
            {mode === "signin" ? "No account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
