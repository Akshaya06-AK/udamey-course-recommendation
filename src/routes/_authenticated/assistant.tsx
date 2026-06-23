import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({ meta: [{ title: "AI Assistant — Synapse" }] }),
  component: Assistant,
});

const suggestions = [
  "What should I learn next to become a Data Scientist?",
  "Build me a 12-week AI Engineer roadmap.",
  "How long until I can land a junior frontend role?",
  "Compare Python vs JavaScript for ML.",
];

function Assistant() {
  const [input, setInput] = useState("");
  const transport = useRef(new DefaultChatTransport({ api: "/api/chat" }));
  const { messages, sendMessage, status } = useChat({ transport: transport.current });
  const busy = status === "submitted" || status === "streaming";

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    await sendMessage({ text });
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b border-border p-5">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="size-10 rounded-xl grid place-items-center" style={{ background: "var(--gradient-primary)" }}>
            <Bot className="size-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display text-lg">Synapse Coach</div>
            <div className="text-xs text-muted-foreground">Your always-on AI learning advisor</div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-8 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-primary"><Sparkles className="size-3" /> Ask anything</div>
              <h2 className="font-display text-3xl mt-2">What do you want to learn today?</h2>
              <div className="mt-6 grid sm:grid-cols-2 gap-2 text-left">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => { setInput(s); }} className="card-elevated p-4 text-sm hover:border-primary transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={cn("flex gap-3", isUser && "flex-row-reverse")}>
                <div className={cn("size-8 rounded-full grid place-items-center shrink-0", isUser ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground")}>
                  {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
                </div>
                <div className={cn("rounded-2xl px-4 py-3 max-w-[80%] whitespace-pre-wrap text-sm leading-relaxed",
                  isUser ? "bg-secondary/20 text-foreground" : "bg-surface-2",
                )}>{text || "…"}</div>
              </div>
            );
          })}
          {busy && (
            <div className="flex gap-3">
              <div className="size-8 rounded-full bg-primary grid place-items-center"><Bot className="size-4 text-primary-foreground" /></div>
              <div className="rounded-2xl px-4 py-3 bg-surface-2 text-sm text-muted-foreground">Thinking…</div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={submit} className="border-t border-border p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <input
            value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about courses, roadmaps, timelines…"
            className="flex-1 rounded-xl bg-surface-2 px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/40"
          />
          <button disabled={busy || !input.trim()} className="rounded-xl bg-primary text-primary-foreground px-4 py-3 hover:opacity-90 disabled:opacity-40 inline-flex items-center gap-1">
            <Send className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
