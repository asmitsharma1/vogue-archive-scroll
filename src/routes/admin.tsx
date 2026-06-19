import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AdminAuthProvider } from "@/context/AdminAuthContext";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({
    meta: [{ title: "Admin | Luxeholic" }, { name: "robots", content: "noindex" }],
  }),
});

function AdminLayout() {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  );
}
