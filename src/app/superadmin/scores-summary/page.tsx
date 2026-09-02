import { createClient } from "@/utils/supabase/server";
import DataGrid from "@/components/SuperAdmin/DataGrid";
import { Award } from "lucide-react";

export const revalidate = 0;

export default async function ScoresSummaryPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("scores_summary")
    .select("*");

  if (error) {
    console.error("Error fetching scores_summary:", error);
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-mist/20 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-5 h-5 text-deep-clay dark:text-warm-stone" />
          <h1 className="text-2xl font-serif font-light text-warm-stone tracking-tight">
            Scores Summary
          </h1>
        </div>
        <p className="text-xs text-slate-mist font-light">
          Final Varna ESG ratings, pillar breakdowns (E, S, G, C), narratives, and assessor roadmaps.
        </p>
      </div>

      <DataGrid
        tableName="scores_summary"
        title="Scores Summary Table"
        subtitle="Consolidated evaluation data directly reflected on the client dashboard."
        initialData={data || []}
        primaryKeyColumn="id"
        readOnlyColumns={["id", "enterprise_id"]}
      />
    </div>
  );
}
