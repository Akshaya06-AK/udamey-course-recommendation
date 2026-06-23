import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) return new Response("messages required", { status: 400 });
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system:
            "You are Synapse, an upbeat AI learning coach inside a course recommendation platform. " +
            "Help learners pick courses, build career roadmaps (Data Scientist, AI Engineer, Full Stack, Cybersecurity, Cloud Architect), " +
            "estimate timelines, suggest projects, and identify skill gaps. Be concise, use short markdown lists, and end with one actionable next step.",
          messages: await convertToModelMessages(messages),
        });
        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
