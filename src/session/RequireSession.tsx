import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "./SessionProvider";

/**
 * Guard for the dashboard only: every other page stays public. A visitor without a device session
 * is sent to the sign-in page, and a signed-in visitor who has not been through the preferences
 * step is sent there first.
 */
export function RequireSession({ children }: { children: ReactNode }) {
  const { session } = useSession();
  if (!session) return <Navigate to="/login" replace />;
  if (!session.onboardingComplete) return <Navigate to="/profil" replace />;
  return <>{children}</>;
}
