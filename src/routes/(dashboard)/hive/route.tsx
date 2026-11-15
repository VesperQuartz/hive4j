import { createFileRoute, Outlet } from "@tanstack/react-router";
import { HiveShell } from "@/components/hive/shell";

const HiveLayout = () => (
  <HiveShell>
    <Outlet />
  </HiveShell>
);

export const Route = createFileRoute("/(dashboard)/hive")({
  component: HiveLayout,
  head: () => ({
    meta: [
      { title: "Hive — decision memory" },
      {
        name: "description",
        content:
          "Ask a team's notes why. Every answer comes with the graph it used, and every correction leaves a trail.",
      },
    ],
  }),
});
