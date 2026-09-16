import { createClient } from "@/utils/supabase/server";
import DataGrid from "@/components/SuperAdmin/DataGrid";
import { Users } from "lucide-react";

export const revalidate = 0;

export default async function ClientSummaryPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("client_summary")
    .select("*");

  if (error) {
    console.error("Error fetching client_summary:", error);
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-mist/20 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-sage-mineral" />
          <h1 className="text-2xl font-sans font-medium text-warm-stone tracking-tight">
            Client Summary KPI Metrics
          </h1>
        </div>
        <p className="text-xs text-slate-mist font-light">
          Overview KPIs per client including total spend, CO2e avoided, women workforce, and active suppliers.
        </p>
      </div>

      <DataGrid
        tableName="client_summary"
        title="Client Summary Table"
        subtitle="Aggregated sustainability and procurement benchmarks shown on overview cards."
        initialData={data || []}
        primaryKeyColumn="id"
        readOnlyColumns={["id", "client_id"]}
      />
    </div>
  );
}
