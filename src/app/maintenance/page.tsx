import type { Metadata } from "next";
import MaintenanceView from "@/components/MaintenanceView";

export const metadata: Metadata = {
  title: "Maintenance & Platform Upgrade | Varna Collective",
  description: "The Varna dashboard is temporarily undergoing an infrastructure upgrade and will be back online shortly.",
};

export default function MaintenancePage() {
  return <MaintenanceView />;
}

