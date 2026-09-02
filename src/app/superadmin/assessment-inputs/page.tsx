import { createClient } from "@/utils/supabase/server";
import DataGrid from "@/components/SuperAdmin/DataGrid";
import { FileSpreadsheet } from "lucide-react";

export const revalidate = 0;

export default async function AssessmentInputsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assessment_inputs")
    .select("*");

  if (error) {
    console.error("Error fetching assessment_inputs:", error);
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-mist/20 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <FileSpreadsheet className="w-5 h-5 text-sage-mineral" />
          <h1 className="text-2xl font-serif font-light text-warm-stone tracking-tight">
            Assessment Inputs
          </h1>
        </div>
        <p className="text-xs text-slate-mist font-light">
          Self-assessment inputs across environmental, gender, wages, and governance indicators.
        </p>
      </div>

      <DataGrid
        tableName="assessment_inputs"
        title="Assessment Inputs"
        subtitle="Raw questionnaire metrics and calculated percentages per enterprise."
        initialData={data || []}
        primaryKeyColumn="id"
        readOnlyColumns={["id", "enterprise_id"]}
      />
    </div>
  );
}
