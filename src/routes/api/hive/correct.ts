import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/hive/correct")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { correctDecision } = await import("@/lib/hive/correct");
          const { hiveConnection } = await import("@/lib/hive/db");
          const body = (await request.json()) as {
            decisionId?: string;
            text?: string;
            reason?: string;
          };
          if (!body.decisionId) {
            return Response.json({ error: "Choose a decision to correct." }, { status: 400 });
          }
          const result = correctDecision(hiveConnection(), {
            decisionId: body.decisionId,
            text: body.text ?? "",
            reason: body.reason ?? "",
          });
          return Response.json(result);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "The correction could not be saved.";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
