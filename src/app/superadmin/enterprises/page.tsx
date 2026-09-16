import { createClient } from "@/utils/supabase/server";
import DataGrid from "@/components/SuperAdmin/DataGrid";
import { Building2 } from "lucide-react";

export const revalidate = 0; // Fresh database data on every load

export default async function EnterprisesPage() {
  const supabase = await createClient();

  // Fetch all enterprises from enterprise_master table
  const { data: enterprises, error } = await supabase
    .from("enterprise_master")
    .select("*")
    .order("enterprise_id", { ascending: true });

  if (error) {
    console.error("Supabase error fetching enterprises:", error);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-mist/20 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-deep-clay dark:text-warm-stone" />
            <h1 className="text-2xl font-sans font-medium text-warm-stone tracking-tight">
              Enterprise Master Directory
            </h1>
          </div>
          <p className="text-xs text-slate-mist font-light">
            View, audit, and modify supplier enterprise records. Cell edits are immediately synced to PostgreSQL.
          </p>
        </div>
      </div>

      {/* Spreadsheet Data Grid */}
      <DataGrid
        tableName="enterprise_master"
        title="Enterprise Master"
        subtitle="Primary database registry of vetted artisan and ethical manufacturer enterprises."
        initialData={enterprises || []}
        primaryKeyColumn="enterprise_id"
        readOnlyColumns={["enterprise_id", "created_at"]}
      />
    </div>
  );
}
