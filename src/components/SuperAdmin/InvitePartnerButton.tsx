"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  X,
  Send,
  Eye,
  Bookmark,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";

export interface ClientOption {
  id: string;
  name: string;
}

export interface InvitePartnerButtonProps {
  label?: string;
  className?: string;
  variant?: "primary" | "secondary";
  clients?: ClientOption[];
  onSuccess?: (result: any) => void;
  initialOpen?: boolean;
}

const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const DEFAULT_CATEGORIES = [
  "Bathroom Amenities",
  "Spa & Wellness",
  "Disposables",
  "Textiles & Linen",
  "Food & Beverage",
  "Handicrafts & Decor",
  "Stationery",
  "Cleaning & Housekeeping",
  "Packaging",
  "Furniture & Furnishings",
];

export default function InvitePartnerButton({
  label = "+ Invite Partner",
  className,
  variant = "primary",
  clients: initialClients,
  onSuccess,
  initialOpen = false,
}: InvitePartnerButtonProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [step, setStep] = useState<"form" | "preview" | "confirmed">("form");
  const [clientsList, setClientsList] = useState<ClientOption[]>(initialClients || []);
  const [categoriesList, setCategoriesList] = useState<string[]>(DEFAULT_CATEGORIES);

  // Form State
  const [enterpriseName, setEnterpriseName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [clientId, setClientId] = useState("");
  const [category, setCategory] = useState("");
  const [stateName, setStateName] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [validityDays, setValidityDays] = useState(30);

  // UI state
  const [submittingAction, setSubmittingAction] = useState<"send" | "preview" | "save" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Preview state
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");

  // Confirmation state
  const [invitationUrl, setInvitationUrl] = useState("");
  const [confirmedSlug, setConfirmedSlug] = useState("");
  const [confirmedStatus, setConfirmedStatus] = useState<"sent" | "pending">("sent");
  const [copied, setCopied] = useState(false);

  // Fetch clients & categories if not provided
  useEffect(() => {
    if (isOpen && (!clientsList || clientsList.length === 0)) {
      fetch("/api/superadmin/invite-partner")
        .then((r) => r.json())
        .then((data) => {
          if (data.clients && Array.isArray(data.clients)) {
            setClientsList(data.clients);
          }
          if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
            setCategoriesList(data.categories.map((c: any) => c.name));
          }
        })
        .catch(() => {
          // Keep defaults
        });
    }
  }, [isOpen, clientsList]);

  const resetForm = () => {
    setEnterpriseName("");
    setBrandName("");
    setContactPerson("");
    setContactEmail("");
    setPhone("");
    setClientId("");
    setCategory("");
    setStateName("");
    setPersonalNote("");
    setValidityDays(30);
    setErrorMsg(null);
    setPreviewHtml("");
    setPreviewSubject("");
    setInvitationUrl("");
    setConfirmedSlug("");
    setCopied(false);
    setStep("form");
  };

  const handleOpen = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(resetForm, 250);
  };

  const validate = () => {
    if (!enterpriseName.trim()) {
      setErrorMsg("Enterprise legal name is required.");
      return false;
    }
    if (!contactPerson.trim()) {
      setErrorMsg("Contact person name is required.");
      return false;
    }
    if (!contactEmail.trim() || !contactEmail.includes("@")) {
      setErrorMsg("A valid contact email address is required.");
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const handleSubmit = async (action: "send" | "preview" | "save") => {
    if (!validate()) return;

    setSubmittingAction(action);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/superadmin/invite-partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enterprise_name: enterpriseName.trim(),
          brand_name: brandName.trim() || null,
          contact_person: contactPerson.trim(),
          contact_email: contactEmail.trim(),
          phone: phone.trim() || null,
          client_id: clientId || null,
          category: category || null,
          state: stateName || null,
          personal_note: personalNote.trim() || null,
          validity_days: Number(validityDays) || 30,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to process partner invitation.");
      }

      if (action === "preview") {
        setPreviewHtml(data.preview_html);
        setPreviewSubject(data.subject || "Partner Assessment Invitation");
        setStep("preview");
      } else {
        // 'send' or 'save'
        setInvitationUrl(data.invitation_url);
        setConfirmedSlug(data.slug);
        setConfirmedStatus(action === "send" ? "sent" : "pending");
        setStep("confirmed");
        if (onSuccess) {
          onSuccess(data);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleCopyLink = async () => {
    if (!invitationUrl) return;
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const buttonClasses =
    className ||
    (variant === "secondary" ? "sa-btn-secondary" : "sa-btn-primary");

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={buttonClasses}
        title="Invite partner enterprise"
      >
        <Mail className="w-4 h-4 shrink-0" />
        <span>{label}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="sa-overlay"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Slide-over Container */}
          <div
            className="sa-slideover"
            style={{
              width: step === "preview" ? "min(92vw, 680px)" : "min(92vw, 520px)",
              transition: "width 200ms ease",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-modal-title"
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--sa-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--sa-white)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "var(--sa-radius-sm)",
                    background: "var(--sa-accent-tint)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Mail className="w-4 h-4" style={{ color: "var(--sa-accent)" }} />
                </div>
                <div>
                  <h2
                    id="invite-modal-title"
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "var(--sa-ink)",
                      margin: 0,
                    }}
                  >
                    {step === "preview"
                      ? "Email Preview"
                      : step === "confirmed"
                      ? "Invitation Ready"
                      : "Invite Partner Enterprise"}
                  </h2>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--sa-muted)",
                      margin: "2px 0 0 0",
                    }}
                  >
                    {step === "preview"
                      ? "Review the invitation email before dispatching"
                      : step === "confirmed"
                      ? "Assessment link generated and registered"
                      : "Send an assessment link or save for review"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--sa-muted)",
                  padding: "6px",
                  borderRadius: "var(--sa-radius-sm)",
                }}
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div
                style={{
                  padding: "10px 20px",
                  background: "var(--sa-danger-tint)",
                  color: "var(--sa-danger-fg)",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  borderBottom: "1px solid rgba(192,57,43,0.15)",
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Body Steps */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px",
                background: "var(--sa-canvas)",
              }}
            >
              {/* STEP 1: FORM */}
              {step === "form" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Enterprise legal name */}
                  <div>
                    <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                      Enterprise Legal Name <span style={{ color: "var(--sa-accent)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="sa-input"
                      placeholder="e.g. Bare Necessities Zero Waste Solutions Pvt Ltd"
                      value={enterpriseName}
                      onChange={(e) => setEnterpriseName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Brand / Trading name */}
                  <div>
                    <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                      Brand / Trading Name
                    </label>
                    <input
                      type="text"
                      className="sa-input"
                      placeholder="e.g. Bare Necessities"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                    />
                  </div>

                  {/* Contact Person & Email */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                        Contact Person <span style={{ color: "var(--sa-accent)" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="sa-input"
                        placeholder="e.g. Sahar Mansoor"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                        Contact Email <span style={{ color: "var(--sa-accent)" }}>*</span>
                      </label>
                      <input
                        type="email"
                        className="sa-input"
                        placeholder="e.g. contact@barenecessities.in"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Phone & State */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                        Phone
                      </label>
                      <input
                        type="tel"
                        className="sa-input"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                        State (India)
                      </label>
                      <select
                        className="sa-input"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                      >
                        <option value="">Select state...</option>
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Client Organisation & Product Category */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                        Client Organisation
                      </label>
                      <select
                        className="sa-input"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                      >
                        <option value="">None / General pool</option>
                        {clientsList.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                        Product Category
                      </label>
                      <select
                        className="sa-input"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="">Select category...</option>
                        {categoriesList.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Validity Days */}
                  <div>
                    <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                      Validity (Days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      className="sa-input"
                      value={validityDays}
                      onChange={(e) => setValidityDays(Number(e.target.value) || 30)}
                      style={{ maxWidth: "140px" }}
                    />
                  </div>

                  {/* Personal Note */}
                  <div>
                    <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                      Personal Note (Included in Email)
                    </label>
                    <textarea
                      rows={3}
                      className="sa-input"
                      placeholder="Optional message from the hospitality client or Varna team..."
                      value={personalNote}
                      onChange={(e) => setPersonalNote(e.target.value)}
                      style={{ resize: "vertical" }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: PREVIEW EMAIL */}
              {step === "preview" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div
                    style={{
                      background: "var(--sa-white)",
                      border: "1px solid var(--sa-border)",
                      borderRadius: "var(--sa-radius-sm)",
                      padding: "10px 14px",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: "var(--sa-muted)" }}>Subject: </span>
                      <span style={{ color: "var(--sa-ink)" }}>{previewSubject}</span>
                    </div>
                    <span className="sa-pill sa-pill-draft">Draft Preview</span>
                  </div>

                  {/* Email iframe */}
                  <div
                    style={{
                      background: "var(--sa-white)",
                      border: "1px solid var(--sa-border)",
                      borderRadius: "var(--sa-radius-md)",
                      overflow: "hidden",
                      boxShadow: "var(--sa-shadow-sm)",
                      height: "460px",
                    }}
                  >
                    <iframe
                      srcDoc={previewHtml}
                      title="Email Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        background: "#FAF7F2",
                      }}
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: CONFIRMATION SCREEN */}
              {step === "confirmed" && (
                <div
                  style={{
                    background: "var(--sa-white)",
                    border: "1px solid var(--sa-border)",
                    borderRadius: "var(--sa-radius-md)",
                    padding: "32px 24px",
                    textAlign: "center",
                    boxShadow: "var(--sa-shadow-sm)",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background:
                        confirmedStatus === "sent"
                          ? "var(--sa-success-tint)"
                          : "var(--sa-warning-tint)",
                      color:
                        confirmedStatus === "sent"
                          ? "var(--sa-success)"
                          : "var(--sa-warning-fg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px auto",
                    }}
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      color: "var(--sa-ink)",
                      marginBottom: "6px",
                    }}
                  >
                    {confirmedStatus === "sent"
                      ? "Invitation Dispatched Successfully"
                      : "Invitation Saved as Pending"}
                  </h3>

                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--sa-muted)",
                      maxWidth: "380px",
                      margin: "0 auto 24px auto",
                      lineHeight: 1.5,
                    }}
                  >
                    {confirmedStatus === "sent"
                      ? `The invitation email has been sent to ${contactEmail}. The partner can now access their dedicated assessment portal.`
                      : `The partner profile for ${enterpriseName} has been saved. You can send the invitation link whenever you are ready.`}
                  </p>

                  {/* Shareable Link Box */}
                  <div
                    style={{
                      background: "var(--sa-sand)",
                      border: "1px solid var(--sa-border)",
                      borderRadius: "var(--sa-radius-sm)",
                      padding: "12px 14px",
                      textAlign: "left",
                      marginBottom: "24px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                      }}
                    >
                      <span className="sa-label">Generated Invitation URL</span>
                      <span className="sa-pill sa-pill-active">Active</span>
                    </div>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        type="text"
                        readOnly
                        value={invitationUrl}
                        className="sa-input"
                        style={{
                          fontSize: "12px",
                          fontFamily: "ui-monospace, monospace",
                          background: "var(--sa-white)",
                        }}
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className={copied ? "sa-btn-primary" : "sa-btn-secondary"}
                        style={{
                          whiteSpace: "nowrap",
                          padding: "8px 12px",
                          fontSize: "12px",
                        }}
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Link
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="sa-btn-secondary"
                      style={{ fontSize: "12px" }}
                    >
                      + Invite Another Partner
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="sa-btn-primary"
                      style={{ fontSize: "12px" }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            {step !== "confirmed" && (
              <div
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid var(--sa-border)",
                  background: "var(--sa-white)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                {step === "preview" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setStep("form")}
                      className="sa-btn-secondary"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back to Edit
                    </button>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => handleSubmit("save")}
                        disabled={submittingAction !== null}
                        className="sa-btn-secondary"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        Save Pending
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSubmit("send")}
                        disabled={submittingAction !== null}
                        className="sa-btn-primary"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {submittingAction === "send" ? "Sending..." : "Send Now"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="sa-btn-secondary"
                    >
                      Cancel
                    </button>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => handleSubmit("preview")}
                        disabled={submittingAction !== null}
                        className="sa-btn-secondary"
                        title="Preview the email before sending"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {submittingAction === "preview" ? "Loading..." : "Preview Email"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSubmit("save")}
                        disabled={submittingAction !== null}
                        className="sa-btn-secondary"
                        title="Save as pending without sending email"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        {submittingAction === "save" ? "Saving..." : "Save as Pending"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSubmit("send")}
                        disabled={submittingAction !== null}
                        className="sa-btn-primary"
                        title="Send invitation email now"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {submittingAction === "send" ? "Sending..." : "Send Now"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
