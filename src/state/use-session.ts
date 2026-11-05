import { useSyncExternalStore } from "react";

import { authService } from "@/services/auth.service";

/** Current simulated session. Always null during SSR. */
export function useSession() {
  return useSyncExternalStore(authService.subscribe, authService.getSession, () => null);
}
