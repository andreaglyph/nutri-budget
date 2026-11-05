import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { APP_MOBILE_PRIMARY, APP_NAV } from "@/components/layout/nav-config";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { authService } from "@/services/auth.service";
import { useSession } from "@/state/use-session";

/**
 * Private USER workspace. The guard is conceptual (simulated session stored in
 * the browser), so the route renders client-side only.
 */
export const Route = createFileRoute("/app")({
  ssr: false,
  beforeLoad: ({ location }) => {
    const session = authService.getSession();
    if (!session) {
      throw redirect({ to: "/ingresar", search: { redirect: location.href } });
    }
    if (!session.onboardingCompleted) {
      throw redirect({ to: "/onboarding" });
    }
    return { session };
  },
  component: AppLayout,
});

function AppLayout() {
  const { session: initial } = Route.useRouteContext();
  const session = useSession() ?? initial;
  return (
    <WorkspaceShell area="app" session={session} groups={APP_NAV} mobilePrimary={APP_MOBILE_PRIMARY}>
      <Outlet />
    </WorkspaceShell>
  );
}
