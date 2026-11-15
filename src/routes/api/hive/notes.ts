import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/hive/notes")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { createNote } = await import("@/lib/hive/library");
          const { hiveConnection } = await import("@/lib/hive/db");
          const body = (await request.json()) as {
            title?: string;
            body?: string;
            authorId?: string;
            projectIds?: string[];
            decision?: { text?: string; reason?: string };
          };
          return Response.json(
            createNote(hiveConnection(), {
              title: body.title ?? "",
              body: body.body ?? "",
              authorId: body.authorId ?? "",
              projectIds: body.projectIds ?? [],
              decision: body.decision
                ? { text: body.decision.text ?? "", reason: body.decision.reason ?? "" }
                : undefined,
            }),
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : "The note could not be saved.";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
