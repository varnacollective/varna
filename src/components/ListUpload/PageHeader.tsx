import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";

/** Page header for the list upload pages, laid out like the other superadmin pages. */
export default function PageHeader({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle: string }) {
  return (
    <header className="flex flex-col gap-4 border-b border-[var(--sa-border)] pb-4">
      <Link href="/superadmin/partners/invitations" className="sa-btn-secondary w-fit" style={{ padding: "6px 12px" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to invitations
      </Link>
      <div>
        <div className="mb-1 flex items-center gap-2">
          <Icon className="h-5 w-5 shrink-0 text-[var(--sa-accent)]" aria-hidden />
          <h1 className="sa-page-title">{title}</h1>
        </div>
        <p className="mt-1 break-words text-[13px] text-[var(--sa-muted)]">{subtitle}</p>
      </div>
    </header>
  );
}
