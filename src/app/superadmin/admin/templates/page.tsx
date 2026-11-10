import React from "react";
import { createAdminClient } from "@/utils/supabase/admin";
import { FileText } from "lucide-react";
import TemplatesClientView from "./TemplatesClientView";

export const revalidate = 0;

export default async function AdminTemplatesPage() {
  const supabase = createAdminClient();

  const [templatesRes, rulesRes] = await Promise.all([
    supabase
      .from("email_templates")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("mandatory_document_rules")
      .select("*")
      .order("category"),
  ]);

  let templates = templatesRes.data || [];
  if (templates.length === 0) {
    templates = [
      {
        id: "tpl-001",
        name: "Standard Partner Invitation",
        subject: "Invitation: Join the Varna Partner Network — {{enterprise_name}}",
        html_body: "<h1>Dear {{contact_person}}</h1><p>You have been invited to participate in the Varna Supplier Assessment...</p>",
        plain_body: "Dear {{contact_person}},\n\nYou have been invited to participate in the Varna Supplier Assessment...",
        version: 1,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "tpl-002",
        name: "Document Verification Nudge",
        subject: "Action Required: Verify documents for {{enterprise_name}}",
        html_body: "<h1>Document Follow-Up</h1><p>Our audit team reviewed your submission and requires clarification on GST/MSME certificates...</p>",
        plain_body: "Our audit team reviewed your submission and requires clarification...",
        version: 1,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "tpl-003",
        name: "Assessment Completion & Rating Published",
        subject: "Congratulations: Your Varna Rating & Certificate are Ready",
        html_body: "<h1>Assessment Complete</h1><p>Your sustainability rating has been signed off and published to your client partners...</p>",
        plain_body: "Your sustainability rating has been signed off and published...",
        version: 1,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];
  }

  let rules = rulesRes.data || [];
  if (rules.length === 0) {
    rules = [
      {
        id: "rule-01",
        category: "All Suppliers",
        document_type: "GST Registration Certificate",
        is_required: true,
        description: "Valid GSTIN registration showing registered state and business legal name.",
      },
      {
        id: "rule-02",
        category: "Artisans & MSMEs",
        document_type: "Udyam Registration Certificate",
        is_required: true,
        description: "Official Ministry of MSME registration certificate verifying enterprise classification.",
      },
      {
        id: "rule-03",
        category: "Textiles & Linen",
        document_type: "OEKO-TEX / GOTS Certification",
        is_required: false,
        description: "Organic textile standard or chemical safety certification for cotton/linen goods.",
      },
      {
        id: "rule-04",
        category: "Amenities & F&B",
        document_type: "FSSAI / FDA License",
        is_required: true,
        description: "Food safety authority registration for edible and consumable bathroom/wellness products.",
      },
    ];
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          borderBottom: "1px solid var(--sa-border)",
          paddingBottom: "16px",
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5" style={{ color: "var(--sa-accent)" }} />
            <h1 className="sa-page-title">Templates &amp; Mandatory Rules</h1>
          </div>
          <p style={{ fontSize: "13px", color: "var(--sa-muted)", marginTop: "4px" }}>
            Maintain standardized email notification copies and configure mandatory evidence rules by category.
          </p>
        </div>
      </div>

      <TemplatesClientView initialTemplates={templates} initialRules={rules} />
    </div>
  );
}
