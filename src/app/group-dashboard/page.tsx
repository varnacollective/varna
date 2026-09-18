import { redirect } from "next/navigation";

export type {
  GroupSummaryData,
  HotelLeaderboardItem,
  SupplierBandSpend,
  SupplierTierCount,
  FullGroupDashboardData,
} from "@/types/group-dashboard";

export default function GroupDashboardLegacyRedirect() {
  redirect("/group/dashboard");
}
