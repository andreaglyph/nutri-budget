import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { ADMIN_MOBILE_PRIMARY, ADMIN_NAV } from "@/components/layout/nav-config";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { authService } from "@/services/auth.service";
import { useSession } from "@/state/use-session";

/** Separate ADMIN workspace. USER sessions are redirected to /app with a notice. */
export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: ({ location }) => {
    const session = authService.getSession();
    if (!session) {
      throw redirect({ to: "/ingresar", search: { redirect: location.href } });
    }
    if (session.role !== "ADMIN") {
      authService.setFlash("No tienes permisos para ver el área de administración.");
      throw redirect({ to: "/app" });
    }
    return { session };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { session: initial } = Route.useRouteContext();
  const session = useSession() ?? initial;
  return (
    <WorkspaceShell area="admin" session={session} groups={ADMIN_NAV} mobilePrimary={ADMIN_MOBILE_PRIMARY}>
      <Outlet />
    </WorkspaceShell>
  );
}
