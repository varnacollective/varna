import Link from "next/link";
import { ArrowLeft, FileUp } from "lucide-react";
import UploadForm from "@/components/ListUpload/UploadForm";
import { createAdminClient } from "@/utils/supabase/admin";

export const metadata = { title: "Upload a supplier list" };

export default async function ListUploadPage() {
  const { data: clients } = await createAdminClient()
    .from("partner_clients")
    .select("id, name")
    .order("name");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2 border-b border-[var(--sa-border)] pb-4">
        <Link
          href="/superadmin/partners/invitations"
          className="inline-flex w-fit items-center gap-1 text-xs text-[var(--sa-muted)] hover:text-[var(--sa-ink)] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Invitations
        </Link>
        <div className="flex items-center gap-2">
          <FileUp className="h-5 w-5 text-[var(--sa-accent)]" aria-hidden />
          <h1 className="sa-page-title">Upload a supplier list</h1>
        </div>
        <p className="text-[13px] text-[var(--sa-muted)]">
          Add the hotel&apos;s list as it came: a spreadsheet, a PDF, photos of the pages, or text pasted from an email.
          The suppliers are found for you, and nothing is sent until you approve it.
        </p>
      </header>
      <UploadForm clients={clients ?? []} />
    </div>
  );
}
