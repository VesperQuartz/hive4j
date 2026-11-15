import { createFileRoute, Outlet } from "@tanstack/react-router";

const DashboardLayout = () => <Outlet />;

export const Route = createFileRoute("/(dashboard)")({
  component: DashboardLayout,
});
