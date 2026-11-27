import { FileUp } from "lucide-react";
import PageHeader from "@/components/ListUpload/PageHeader";
import UploadForm from "@/components/ListUpload/UploadForm";
import { createAdminClient } from "@/utils/supabase/admin";

export const metadata = { title: "Upload a supplier list" };

export default async function ListUploadPage() {
  const { data: clients } = await createAdminClient()
    .from("partner_clients")
    .select("id, name")
    .order("name");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader
        icon={FileUp}
        title="Upload a Supplier List"
        subtitle="Add the hotel's list as it came: a spreadsheet, a PDF, photos of the pages, or text pasted from an email. The suppliers are found for you, and nothing is sent until you approve it."
      />
      <UploadForm clients={clients ?? []} />
    </div>
  );
}
