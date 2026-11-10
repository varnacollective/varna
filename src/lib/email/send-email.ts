import "server-only";
import nodemailer from "nodemailer";
import { createAdminClient } from "@/utils/supabase/admin";
import { createRateLimiter } from "@/lib/rate-limiter";
import { validateEmail } from "@/lib/validators";
import {
  renderInvitationEmail,
  type InvitationEmailParams,
} from "./invitation-template";

export interface SendInvitationEmailParams extends InvitationEmailParams {
  /**
   * Recipient email address.
   */
  to?: string;
  to_email?: string;
  recipient_email?: string;
  email?: string;

  /**
   * Optional IDs for tracking against invitation records in the database.
   */
  invitation_id?: string;
  enterprise_id?: string;
}

export interface SendInvitationEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// In-memory rate limiter: maximum 5 emails per 60 seconds
const emailRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 60_000,
});

/**
 * Persists an invitation email record to the `invitation_messages` table.
 * Soft-fails with a warning if the table or columns are not yet provisioned.
 */
async function recordInvitationMessage(data: {
  recipient_email: string;
  enterprise_name: string;
  invitation_url: string;
  subject: string;
  html_body?: string;
  plain_body?: string;
  message_id?: string;
  status: "sent" | "failed";
  error_message?: string;
  invitation_id?: string;
  enterprise_id?: string;
}): Promise<void> {
  try {
    const supabase = createAdminClient();
    const payload: Record<string, unknown> = {
      direction: "outbound",
      recipient_email: data.recipient_email,
      enterprise_name: data.enterprise_name,
      invitation_url: data.invitation_url,
      subject: data.subject,
      status: data.status,
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    if (data.html_body) payload.html_body = data.html_body;
    if (data.plain_body) payload.plain_body = data.plain_body;
    if (data.message_id) payload.message_id = data.message_id;
    if (data.error_message) payload.error_message = data.error_message;
    if (data.invitation_id) payload.invitation_id = data.invitation_id;
    if (data.enterprise_id) payload.enterprise_id = data.enterprise_id;

    const { error } = await supabase.from("invitation_messages").insert(payload);
    if (error) {
      console.warn(
        `[sendInvitationEmail] Notice: could not record to invitation_messages: ${error.message}`
      );
    }
  } catch (err) {
    console.warn(
      `[sendInvitationEmail] Notice: error recording invitation message in Supabase:`,
      err
    );
  }
}

/**
 * Sends a Varna Partner Network assessment invitation email.
 * - Uses SMTP transport if configured via environment variables.
 * - Falls back to development logging if SMTP variables are not set.
 * - Applies a 5-email/minute rate limit.
 * - Records outcome to `invitation_messages` using `createAdminClient()`.
 */
export async function sendInvitationEmail(
  params: SendInvitationEmailParams
): Promise<SendInvitationEmailResult> {
  const recipient =
    params.to || params.to_email || params.recipient_email || params.email;

  if (!recipient || !validateEmail(recipient)) {
    return {
      success: false,
      error: `Invalid recipient email address: "${recipient || ""}"`,
    };
  }

  // Rate limit guard (max 5 emails/minute)
  const rateLimitStatus = emailRateLimiter.check("invitation_emails_global");
  if (!rateLimitStatus.allowed) {
    const waitSeconds = Math.max(
      1,
      Math.ceil((rateLimitStatus.resetAt - Date.now()) / 1000)
    );
    const errorMsg = `Email rate limit exceeded (maximum 5 emails per minute). Please try again in ${waitSeconds}s.`;
    console.warn(`[sendInvitationEmail] ${errorMsg}`);
    return {
      success: false,
      error: errorMsg,
    };
  }

  // Render email templates
  const { html, text, subject } = renderInvitationEmail(params);

  const fromEmail =
    process.env.INVITATION_FROM_EMAIL || "invitations@varnacollective.com";
  const fromName =
    process.env.INVITATION_FROM_NAME || "Varna Collective";
  const replyTo =
    process.env.INVITATION_REPLY_TO ||
    process.env.VARNA_HELP_EMAIL ||
    "yuvraj@varnacollective.com";

  const isSmtpConfigured = Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );

  // Development / fallback mode when SMTP is not configured
  if (!isSmtpConfigured) {
    const simulatedMessageId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    console.log(
      `\n================= [DEV MODE] INVITATION EMAIL =================\n` +
      `From: "${fromName}" <${fromEmail}>\n` +
      `To: ${recipient}\n` +
      `Reply-To: ${replyTo}\n` +
      `Subject: ${subject}\n` +
      `Message-ID: ${simulatedMessageId}\n` +
      `----------------- TEXT PREVIEW -----------------\n` +
      `${text}\n` +
      `===============================================================\n`
    );

    await recordInvitationMessage({
      recipient_email: recipient,
      enterprise_name: params.enterprise_name,
      invitation_url: params.invitation_url,
      subject,
      html_body: html,
      plain_body: text,
      message_id: simulatedMessageId,
      status: "sent",
      invitation_id: params.invitation_id,
      enterprise_id: params.enterprise_id,
    });

    return {
      success: true,
      messageId: simulatedMessageId,
    };
  }

  // Production SMTP transport
  try {
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const secure = port === 465;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: recipient,
      replyTo,
      subject,
      text,
      html,
    });

    const messageId = info.messageId || `smtp-${Date.now()}`;

    await recordInvitationMessage({
      recipient_email: recipient,
      enterprise_name: params.enterprise_name,
      invitation_url: params.invitation_url,
      subject,
      html_body: html,
      plain_body: text,
      message_id: messageId,
      status: "sent",
      invitation_id: params.invitation_id,
      enterprise_id: params.enterprise_id,
    });

    return {
      success: true,
      messageId,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to send email via SMTP";

    console.error("[sendInvitationEmail] Error sending invitation:", errorMessage);

    await recordInvitationMessage({
      recipient_email: recipient,
      enterprise_name: params.enterprise_name,
      invitation_url: params.invitation_url,
      subject,
      html_body: html,
      plain_body: text,
      status: "failed",
      error_message: errorMessage,
      invitation_id: params.invitation_id,
      enterprise_id: params.enterprise_id,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}
