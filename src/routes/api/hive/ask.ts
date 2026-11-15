import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/hive/ask")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { askHive } = await import("@/lib/hive/ask");
          const body = (await request.json()) as { question?: string };
          const question = body.question?.trim();
          if (!question) {
            return Response.json({ error: "Ask a question first." }, { status: 400 });
          }
          return Response.json(askHive(question));
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "The graph could not answer that.";
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
