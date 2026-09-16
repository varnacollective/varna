import { createClient } from "@/utils/supabase/server";
import DataGrid from "@/components/SuperAdmin/DataGrid";
import { ShoppingBag } from "lucide-react";

export const revalidate = 0;

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("order_register")
    .select("*");

  if (error) {
    console.error("Error fetching order_register:", error);
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-mist/20 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <ShoppingBag className="w-5 h-5 text-deep-clay dark:text-warm-stone" />
          <h1 className="text-2xl font-sans font-medium text-warm-stone tracking-tight">
            Orders Register
          </h1>
        </div>
        <p className="text-xs text-slate-mist font-light">
          Tracked order volume, dispatch logs, and line-item procurement records.
        </p>
      </div>

      <DataGrid
        tableName="order_register"
        title="Order Register"
        subtitle="Individual fulfillment orders placed with artisanal suppliers."
        initialData={data || []}
        primaryKeyColumn="id"
        readOnlyColumns={["id", "created_at"]}
      />
    </div>
  );
}
