import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { UploadRow } from "@/lib/list-uploads/hotels";
import type { UploadStatus } from "@/lib/list-uploads/types";
import Count from "./Count";
import { formatWhen } from "./format";

const STATUS: Record<UploadStatus, { label: string; pill: string }> = {
  reading: { label: "Not finished", pill: "sa-pill-draft" },
  review: { label: "To review", pill: "sa-pill-pending" },
  done: { label: "Done", pill: "sa-pill-active" },
  failed: { label: "Could not read", pill: "sa-pill-declined" },
  cancelled: { label: "Stopped", pill: "sa-pill-draft" },
};

const uploadHref = (id: string) => `/superadmin/partners/invitations/upload/${id}`;

/** A hotel's uploaded lists, newest first; each opens its review. */
export default function UploadList({ uploads }: { uploads: UploadRow[] }) {
  if (uploads.length === 0) {
    return <p className="sa-card p-8 text-center text-[13px] text-[var(--sa-muted)]">No lists uploaded for this hotel yet.</p>;
  }
  return (
    <div className="@container sa-card overflow-x-auto">
      <table className="sa-table hidden @2xl:table">
        <thead>
          <tr>
            <th>Uploaded</th>
            <th>Files</th>
            <th>Status</th>
            <th className="text-right">Suppliers</th>
            <th className="text-right">Ready</th>
            <th className="text-right" title="Needs attention or missing email">To check</th>
            <th className="text-right">Invited</th>
            <th className="w-10"><span className="sr-only">Open</span></th>
          </tr>
        </thead>
        <tbody>
          {uploads.map((u) => {
            const status = STATUS[u.status];
            const files = u.fileNames.join(", ") || "No files";
            return (
              <tr key={u.id} className="relative">
                <td className="whitespace-nowrap">
                  <Link href={uploadHref(u.id)} className="font-medium text-[var(--sa-ink)] after:absolute after:inset-0 hover:text-[var(--sa-accent)]">
                    {formatWhen(u.createdAt)}
                  </Link>
                </td>
                <td className="max-w-56 truncate text-[var(--sa-ink-2)]" title={files}>{files}</td>
                <td><span className={`sa-pill whitespace-nowrap ${status.pill}`}>{status.label}</span></td>
                <td className="text-right"><Count value={u.counts.total} /></td>
                <td className="text-right"><Count value={u.counts.ready} /></td>
                <td className="text-right"><Count value={u.counts.needs_attention + u.counts.missing_contact} tone="attention" /></td>
                <td className="text-right"><Count value={u.counts.invited} /></td>
                <td className="text-[var(--sa-muted)]"><ChevronRight className="h-4 w-4" aria-hidden /></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ul className="divide-y divide-[var(--sa-border)] @2xl:hidden">
        {uploads.map((u) => {
          const status = STATUS[u.status];
          return (
            <li key={u.id}>
              <Link href={uploadHref(u.id)} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--sa-sand)]">
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[14px] font-medium text-[var(--sa-ink)]">{formatWhen(u.createdAt)}</span>
                    <span className={`sa-pill shrink-0 ${status.pill}`}>{status.label}</span>
                  </span>
                  <span className="truncate text-xs text-[var(--sa-ink-2)]">{u.fileNames.join(", ") || "No files"}</span>
                  <span className="text-xs text-[var(--sa-muted)]">
                    {u.counts.total} suppliers · {u.counts.ready} ready · {u.counts.invited} invited
                  </span>
                  {u.counts.needs_attention + u.counts.missing_contact > 0 && (
                    <span className="text-xs font-medium text-[var(--sa-warning-fg)]">
                      {u.counts.needs_attention + u.counts.missing_contact} to check
                    </span>
                  )}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--sa-muted)]" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
