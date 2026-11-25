import Link from "next/link";
import { notFound } from "next/navigation";
import { ListChecks } from "lucide-react";
import PageHeader from "@/components/ListUpload/PageHeader";
import ReviewView from "@/components/ListUpload/ReviewView";
import RunDetails from "@/components/ListUpload/RunDetails";
import { invitesEnabled } from "@/lib/list-uploads/config";
import { getReviewSuppliers, getUpload } from "@/lib/list-uploads/queries";

export const metadata = { title: "Review suppliers" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ReviewUploadPage({ params }: PageProps<"/superadmin/partners/invitations/upload/[id]">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const upload = await getUpload(id);
  if (!upload) notFound();
  const suppliers = upload.status === "review" || upload.status === "done" ? await getReviewSuppliers(id) : [];

  const fileNames = upload.files.map((f) => f.name).join(", ");
  const when = new Date(upload.createdAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        icon={ListChecks}
        title="Review Suppliers"
        subtitle={`${upload.clientName ?? "General Pool"} · ${fileNames} · ${when}`}
      />

      {upload.status === "review" || upload.status === "done" ? (
        <ReviewView uploadId={id} initialSuppliers={suppliers} failedParts={upload.failedParts} canSend={invitesEnabled()} />
      ) : (
        <div role="status" className="sa-card p-6 text-[13px] text-[var(--sa-ink-2)]">
          {upload.status === "reading"
            ? "This list is still being read, or reading was interrupted. Upload it again if nothing changes."
            : `This list could not be read${upload.error ? `: ${upload.error}` : "."} Upload it again to try once more.`}
          <div className="mt-4">
            <Link href="/superadmin/partners/invitations/upload" className="sa-btn-primary">Upload a list</Link>
          </div>
        </div>
      )}

      <RunDetails upload={upload} />
    </div>
  );
}
