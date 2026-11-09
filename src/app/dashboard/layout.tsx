import type { ReactNode } from "react";
import MaintenanceView from "@/components/MaintenanceView";

/**
 * Maintenance Mode Flag for /dashboard routes:
 * - Set to `true` (or configure NEXT_PUBLIC_MAINTENANCE_MODE="true") to render the maintenance screen.
 * - Set to `false` to restore normal dashboard routing.
 */
const IS_MAINTENANCE_ACTIVE =
  process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true" || false;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  if (IS_MAINTENANCE_ACTIVE) {
    return <MaintenanceView />;
  }

  return <>{children}</>;
}

