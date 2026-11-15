import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/hive/decisions")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { createDecision } = await import("@/lib/hive/library");
          const { hiveConnection } = await import("@/lib/hive/db");
          const body = (await request.json()) as {
            text?: string;
            reason?: string;
            personId?: string;
            projectId?: string;
            noteId?: string;
          };
          return Response.json(
            createDecision(hiveConnection(), {
              text: body.text ?? "",
              reason: body.reason ?? "",
              personId: body.personId ?? "",
              projectId: body.projectId ?? "",
              noteId: body.noteId,
            }),
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "The decision could not be saved.";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
