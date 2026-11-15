import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/hive/library")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { getLibrary } = await import("@/lib/hive/library");
          const { hiveConnection } = await import("@/lib/hive/db");
          return Response.json(getLibrary(hiveConnection()));
        } catch (error) {
          const message = error instanceof Error ? error.message : "The library could not be read.";
          return Response.json({ error: message }, { status: 500 });
        }
      },
      POST: async ({ request }) => {
        try {
          const { createEntity } = await import("@/lib/hive/library");
          const { hiveConnection } = await import("@/lib/hive/db");
          const body = (await request.json()) as {
            kind?: "person" | "project";
            name?: string;
          };
          if (body.kind !== "person" && body.kind !== "project") {
            return Response.json({ error: "Choose person or project." }, { status: 400 });
          }
          return Response.json(
            createEntity(hiveConnection(), { kind: body.kind, name: body.name ?? "" }),
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : "That could not be added.";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
