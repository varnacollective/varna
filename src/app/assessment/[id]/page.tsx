import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import AssessmentForm from "@/components/assessment/AssessmentForm";

export const metadata: Metadata = {
  title: "Enterprise Assessment — Varna Collective",
  description:
    "Complete your enterprise sustainability assessment for Varna Collective's ethical sourcing programme.",
  robots: { index: false, follow: false }, // Keep assessment links private
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AssessmentPage({ params }: PageProps) {
  const { id } = await params;

  // Validate UUID against Supabase
  const supabase = await createClient();
  const { data: link, error } = await supabase
    .from("assessment_links")
    .select("uuid, enterprise_name, status")
    .eq("uuid", id)
    .single();

  // ── Invalid / not found ──────────────────────────────────────────────────
  if (error || !link) {
    return (
      <div className="min-h-screen bg-[#181A1D] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 border border-slate-mist/30 bg-white/5 flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl text-slate-mist">✕</span>
          </div>
          <h1 className="text-2xl font-sans font-medium text-warm-stone mb-3">
            Link Invalid or Expired
          </h1>
          <p className="text-sm text-slate-mist font-light leading-relaxed">
            This assessment link could not be found. Please contact your Varna Collective
            representative to request a new link.
          </p>
        </div>
      </div>
    );
  }

  // ── Already submitted ────────────────────────────────────────────────────
  if (link.status === "submitted") {
    return (
      <div className="min-h-screen bg-[#181A1D] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 border border-sage-mineral/40 bg-sage-mineral/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl text-sage-mineral">✓</span>
          </div>
          <h1 className="text-2xl font-sans font-medium text-warm-stone mb-3">
            Already Submitted
          </h1>
          <p className="text-sm text-slate-mist font-light leading-relaxed">
            The assessment for{" "}
            <span className="text-warm-stone font-medium">{link.enterprise_name}</span> has
            already been submitted. Thank you for your participation.
          </p>
        </div>
      </div>
    );
  }

  // ── Active assessment form ───────────────────────────────────────────────
  return (
    <AssessmentForm uuid={link.uuid} enterpriseName={link.enterprise_name} />
  );
}
