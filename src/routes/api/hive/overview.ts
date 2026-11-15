import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/hive/overview")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { getOverview } = await import("@/lib/hive/overview");
          const { hiveConnection } = await import("@/lib/hive/db");
          return Response.json(getOverview(hiveConnection()));
        } catch (error) {
          const message = error instanceof Error ? error.message : "The graph could not be read.";
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
