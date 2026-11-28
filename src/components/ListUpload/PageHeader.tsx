import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  back?: { href: string; label: string };
  /** Buttons on the right of the title. */
  actions?: ReactNode;
}

/** Page header for the list upload pages, laid out like the other superadmin pages. */
export default function PageHeader({
  icon: Icon,
  title,
  subtitle,
  back = { href: "/superadmin/partners/invitations", label: "Back to invitations" },
  actions,
}: Props) {
  return (
    <header className="flex flex-col gap-4 border-b border-[var(--sa-border)] pb-4">
      <Link href={back.href} className="sa-btn-secondary w-fit" style={{ padding: "6px 12px" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> {back.label}
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <Icon className="h-5 w-5 shrink-0 text-[var(--sa-accent)]" aria-hidden />
            <h1 className="sa-page-title">{title}</h1>
          </div>
          <p className="mt-1 break-words text-[13px] text-[var(--sa-muted)]">{subtitle}</p>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}
