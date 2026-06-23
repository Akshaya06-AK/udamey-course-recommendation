import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getMyProfile, saveOnboarding } from "@/lib/api.functions";
import { INTERESTS, CAREER_GOALS } from "@/lib/recommend";
import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const getProfile = useServerFn(getMyProfile);
  const save = useServerFn(saveOnboarding);
  const { data } = useQuery({ queryKey: ["me"], queryFn: () => getProfile() });

  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [goal, setGoal] = useState<string>("");
  const [name, setName] = useState("");

  const mutation = useMutation({
    mutationFn: () => save({ data: { interests, careerGoal: goal, displayName: name || data?.profile?.display_name || "" } }),
    onSuccess: () => {
      toast.success("Profile saved");
      navigate({ to: "/dashboard" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  function toggle(id: string) {
    setInterests((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  const steps = ["Welcome", "Interests", "Career goal", "Done"];

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl card-elevated p-8">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <Sparkles className="size-3 text-primary" /> Step {step + 1} of {steps.length}
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-surface-2 overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>

        {step === 0 && (
          <div className="mt-8">
            <h1 className="font-display text-3xl">Welcome to Synapse 👋</h1>
            <p className="text-muted-foreground mt-2">In 60 seconds we'll personalize your entire learning experience.</p>
            <input
              placeholder="What should we call you?" value={name} onChange={(e) => setName(e.target.value)}
              className="mt-6 w-full rounded-xl bg-surface-2 px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/40"
            />
            <button onClick={() => setStep(1)} className="mt-6 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2 hover:opacity-90 glow">
              Continue <ArrowRight className="size-4" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="mt-8">
            <h1 className="font-display text-3xl">What are you curious about?</h1>
            <p className="text-muted-foreground mt-2">Pick everything that excites you — at least 2.</p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
              {INTERESTS.map((i) => {
                const on = interests.includes(i.id);
                return (
                  <button
                    key={i.id} onClick={() => toggle(i.id)}
                    className={cn(
                      "relative rounded-2xl p-4 text-left border transition-all",
                      on ? "border-primary bg-primary/10 glow" : "border-border bg-surface-2 hover:bg-accent/60",
                    )}
                  >
                    <div className="text-2xl">{i.emoji}</div>
                    <div className="mt-2 font-medium text-sm">{i.label}</div>
                    {on && <Check className="size-4 text-primary absolute top-3 right-3" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(0)} className="text-sm text-muted-foreground hover:text-foreground">Back</button>
              <button disabled={interests.length < 2} onClick={() => setStep(2)} className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-40 glow inline-flex items-center gap-2">
                Continue <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-8">
            <h1 className="font-display text-3xl">What's your dream role?</h1>
            <p className="text-muted-foreground mt-2">We'll generate the perfect learning path.</p>
            <div className="mt-6 flex flex-col gap-2">
              {CAREER_GOALS.map((g) => {
                const on = goal === g.id;
                return (
                  <button
                    key={g.id} onClick={() => setGoal(g.id)}
                    className={cn(
                      "rounded-2xl p-4 text-left border transition-all flex items-center justify-between",
                      on ? "border-primary bg-primary/10 glow" : "border-border bg-surface-2 hover:bg-accent/60",
                    )}
                  >
                    <div>
                      <div className="font-medium">{g.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{g.skills.slice(0, 4).join(" · ")}</div>
                    </div>
                    {on && <Check className="size-5 text-primary" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(1)} className="text-sm text-muted-foreground hover:text-foreground">Back</button>
              <button disabled={!goal || mutation.isPending} onClick={() => mutation.mutate()} className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-40 glow inline-flex items-center gap-2">
                {mutation.isPending && <Loader2 className="size-4 animate-spin" />} Finish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
