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
  subject: string;
  html_body?: string;
  plain_body?: string;
  message_id?: string;
  status: "sent" | "bounced";
  invitation_id?: string;
}): Promise<void> {
  if (!data.invitation_id) {
    return;
  }
  try {
    const supabase = createAdminClient();
    const payload: Record<string, unknown> = {
      invitation_id: data.invitation_id,
      direction: "outbound",
      subject: data.subject,
      html_body: data.html_body || null,
      plain_body: data.plain_body || null,
      provider_message_id: data.message_id || null,
      status: data.status,
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

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

  const rawFromEmail =
    process.env.INVITATION_FROM_EMAIL ||
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    "tech@varnacollective.com";
  const cleanFromEmail = rawFromEmail.replace(/^["']|["']$/g, "").trim();

  const rawFromName =
    process.env.INVITATION_FROM_NAME || "Varna Collective";
  const cleanFromName = rawFromName.replace(/^["']|["']$/g, "").trim();

  const replyTo = (
    process.env.INVITATION_REPLY_TO ||
    process.env.VARNA_HELP_EMAIL ||
    process.env.SMTP_USER ||
    "tech@varnacollective.com"
  ).replace(/^["']|["']$/g, "").trim();

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
      `From: "${cleanFromName}" <${cleanFromEmail}>\n` +
      `To: ${recipient}\n` +
      `Reply-To: ${replyTo}\n` +
      `Subject: ${subject}\n` +
      `Message-ID: ${simulatedMessageId}\n` +
      `----------------- TEXT PREVIEW -----------------\n` +
      `${text}\n` +
      `===============================================================\n`
    );

    await recordInvitationMessage({
      subject,
      html_body: html,
      plain_body: text,
      message_id: simulatedMessageId,
      status: "sent",
      invitation_id: params.invitation_id,
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
      from: {
        name: cleanFromName,
        address: cleanFromEmail,
      },
      to: recipient,
      replyTo,
      subject,
      text,
      html,
    });

    const messageId = info.messageId || `smtp-${Date.now()}`;

    await recordInvitationMessage({
      subject,
      html_body: html,
      plain_body: text,
      message_id: messageId,
      status: "sent",
      invitation_id: params.invitation_id,
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
      subject,
      html_body: html,
      plain_body: text,
      status: "bounced",
      invitation_id: params.invitation_id,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}
