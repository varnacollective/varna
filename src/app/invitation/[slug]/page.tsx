import React from "react";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { OnboardingForm } from "@/components/invitation/OnboardingForm";
import { StatusPage } from "@/components/invitation/StatusPage";
import { Mail, AlertCircle, Clock, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function InvitationPage({ params }: PageProps) {
  const { slug } = await params;

  if (!slug) {
    return renderNotFound();
  }

  const admin = createAdminClient();

  // 1. Resolve invitation by slug
  const { data: invitation, error } = await admin
    .from("partner_invitations")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !invitation) {
    return renderNotFound();
  }

  // 2. Check expiration
  const now = new Date();
  const isExpired =
    invitation.status === "expired" ||
    (invitation.expires_at && new Date(invitation.expires_at) < now);

  if (isExpired) {
    return (
      <div className="py-12 max-w-lg mx-auto text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#E7DFD3] text-[#B45309] flex items-center justify-center mx-auto">
          <Clock className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9A4A2E]">
            Link Expired
          </span>
          <h1 className="text-3xl font-serif text-[#1E1A16] font-normal">
            Invitation Link Expired
          </h1>
          <p className="text-sm text-[#6B6259] leading-relaxed">
            The assessment invitation link for{" "}
            <strong className="text-[#1E1A16]">{invitation.enterprise_name}</strong> has passed its
            validity window. Security protocols require links to be renewed after expiration.
          </p>
        </div>

        <div className="p-5 bg-[#FFFFFF] border border-[#E7DFD3] rounded-2xl shadow-sm space-y-3 text-xs text-[#6B6259]">
          <p>
            Please request a fresh invitation link from our onboarding team. A new link will be
            emailed to <strong>{invitation.contact_email}</strong>.
          </p>

          <a
            href={`mailto:yuvraj@varnacollective.com?subject=New%20Invitation%20Link%20Request%20-%20${encodeURIComponent(
              invitation.enterprise_name
            )}&body=Hello%20Yuvraj,%20please%20send%20a%20new%20assessment%20link%20for%20${encodeURIComponent(
              invitation.enterprise_name
            )}.`}
            className="inv-btn-primary w-full py-2.5 text-xs font-medium inline-flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span>Request a New Link</span>
          </a>
        </div>
      </div>
    );
  }

  // 3. Check declined
  if (invitation.status === "declined") {
    return (
      <div className="py-12 max-w-lg mx-auto text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#E7DFD3] text-[#6B6259] flex items-center justify-center mx-auto">
          <XCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6259]">
            Archived Link
          </span>
          <h1 className="text-3xl font-serif text-[#1E1A16] font-normal">
            Invitation Declined
          </h1>
          <p className="text-sm text-[#6B6259] leading-relaxed">
            This assessment invitation for{" "}
            <strong className="text-[#1E1A16]">{invitation.enterprise_name}</strong> was marked as
            declined.
          </p>
        </div>

        <div className="p-5 bg-[#FFFFFF] border border-[#E7DFD3] rounded-2xl shadow-sm text-xs text-[#6B6259] space-y-2">
          <p>
            If this was done in error or if your partnership status has changed, please get in
            touch with our team.
          </p>
          <a
            href="mailto:yuvraj@varnacollective.com"
            className="text-[#9A4A2E] hover:underline font-medium inline-block"
          >
            Contact yuvraj@varnacollective.com →
          </a>
        </div>
      </div>
    );
  }

  // 4. Fetch uploaded documents
  const { data: documents } = await admin
    .from("partner_documents")
    .select("*")
    .eq("invitation_id", invitation.id)
    .order("uploaded_at", { ascending: false });

  // 5. Check if submitted or registration completed -> Render StatusPage
  if (
    invitation.status === "submitted" ||
    invitation.status === "registration_completed"
  ) {
    const { data: latestResponse } = await admin
      .from("partner_form_responses")
      .select("*")
      .eq("invitation_id", invitation.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return (
      <StatusPage
        invitation={invitation}
        latestResponse={latestResponse}
        documents={documents || []}
      />
    );
  }

  // 6. Active invitation: Mark as accepted if first visit
  if (["pending", "sent", "delivered"].includes(invitation.status)) {
    await admin
      .from("partner_invitations")
      .update({ status: "accepted" })
      .eq("id", invitation.id);
  }

  // Fetch latest draft
  const { data: draft } = await admin
    .from("partner_form_responses")
    .select("answers, version")
    .eq("invitation_id", invitation.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <OnboardingForm
      invitation={invitation}
      initialData={draft?.answers || {}}
      initialDocs={documents || []}
    />
  );
}

function renderNotFound() {
  return (
    <div className="py-16 max-w-lg mx-auto text-center space-y-6">
      <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#E7DFD3] text-[#9A8E84] flex items-center justify-center mx-auto">
        <AlertCircle className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#9A4A2E]">
          404 · Portal
        </span>
        <h1 className="text-3xl font-serif text-[#1E1A16] font-normal">
          Invitation Not Found
        </h1>
        <p className="text-sm text-[#6B6259] leading-relaxed">
          The link you followed appears to be invalid or does not exist. Please check the URL
          provided in your email.
        </p>
      </div>

      <div className="p-5 bg-[#FFFFFF] border border-[#E7DFD3] rounded-2xl shadow-sm text-xs text-[#6B6259] space-y-2">
        <p>
          Need help locating your invitation? Please email our onboarding team:
        </p>
        <a
          href="mailto:yuvraj@varnacollective.com"
          className="text-[#9A4A2E] hover:underline font-medium inline-block text-sm"
        >
          yuvraj@varnacollective.com
        </a>
      </div>
    </div>
  );
}
