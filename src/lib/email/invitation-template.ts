/**
 * lib/email/invitation-template.ts
 *
 * Reusable HTML and plain text email templates for Varna Partner Network invitations.
 * Built to PRD §7 specifications:
 * - Table-based inline-CSS layout (max-width 600px)
 * - Dark-mode safe metadata and styles
 * - Bulletproof VML fallback CTA button for Microsoft Outlook
 * - Absolute PNG wordmark URL
 */

export interface InvitationEmailParams {
  contact_person: string;
  enterprise_name: string;
  invitation_url: string;
  client_name?: string | null;
  personal_note?: string | null;
  expires_at?: string | null;
  validity_days?: number | null;
}

export interface RenderedEmail {
  html: string;
  text: string;
  subject: string;
}

/**
 * Escapes characters for safe HTML injection.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Formats an ISO expiration date string into human-friendly format.
 */
function formatExpiryDate(expiresAt?: string | null): string {
  if (!expiresAt) {
    return "30 days from receipt";
  }

  try {
    const date = new Date(expiresAt);
    if (isNaN(date.getTime())) {
      return expiresAt;
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return expiresAt;
  }
}

/**
 * Renders the Varna Partner Network assessment invitation email.
 */
export function renderInvitationEmail(
  params: InvitationEmailParams
): RenderedEmail {
  const {
    contact_person,
    enterprise_name,
    invitation_url,
    client_name,
    personal_note,
    expires_at,
    validity_days,
  } = params;

  const siteUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://varnacollective.com"
  ).replace(/\/+$/, "");

  const helpEmail =
    process.env.VARNA_HELP_EMAIL || "yuvraj@varnacollective.com";

  const wordmarkUrl = `${siteUrl}/varna-wordmark-email.png`;

  // Compute expiration if expires_at not directly provided
  const computedExpiry =
    expires_at ||
    (validity_days && validity_days > 0
      ? new Date(Date.now() + validity_days * 86400000).toISOString()
      : undefined);

  const formattedExpiry = formatExpiryDate(computedExpiry);

  const subject = `Invitation: Join the Varna Partner Network — ${enterprise_name}`;
  const preheader =
    "Join the Varna Partner Network · Complete your enterprise assessment";

  const clientCopy = client_name
    ? ` and to be considered for procurement partnerships by ${client_name}`
    : "";

  const introCopy = `Varna is inviting ${enterprise_name} to join the Varna partner network${clientCopy}. The idea is not to grade, but to evaluate our partner capabilities using a transparent scientific process which will enable us to showcase your brand for a global appeal and build consumer confidence while preserving the nuances of your business.`;

  // HTML Email Template
  const html = `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body, table, td, a {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    table {
      border-collapse: collapse !important;
    }
    body {
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #F4F0EA;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    @media (prefers-color-scheme: dark) {
      .body-bg { background-color: #12100E !important; }
      .main-card { background-color: #1C1917 !important; border-color: #2E2A27 !important; }
      .text-heading { color: #FAF8F5 !important; }
      .text-body { color: #E7E5E4 !important; }
      .text-muted { color: #A8A29E !important; }
      .box-bg { background-color: #262220 !important; border-color: #38332E !important; }
      .note-bg { background-color: #24201E !important; border-color: #9A4A2E !important; }
      .footer-text { color: #78716C !important; }
    }
  </style>
</head>
<body class="body-bg" style="margin: 0; padding: 0; background-color: #F4F0EA; -webkit-font-smoothing: antialiased;">
  <!-- Preheader text (hidden in display, visible in inbox preview) -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #F4F0EA; opacity: 0;">
    ${escapeHtml(preheader)}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="body-bg" style="background-color: #F4F0EA; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <!-- Container table: 600px max width -->
        <!--[if (gte mso 9)|(IE)]>
        <table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="main-card" style="max-width: 600px; background-color: #FFFFFF; border-radius: 8px; border: 1px solid #EBE5DF; overflow: hidden;">
          
          <!-- Header with Wordmark -->
          <tr>
            <td align="left" style="padding: 36px 40px 24px 40px; border-bottom: 1px solid #F0ECE6;">
              <a href="${escapeHtml(siteUrl)}" target="_blank" style="text-decoration: none; display: inline-block;">
                <img src="${escapeHtml(wordmarkUrl)}" alt="Varna Collective" width="140" height="auto" style="display: block; border: 0; outline: none; text-decoration: none; max-width: 140px; width: 140px; height: auto;" />
              </a>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 40px 40px 40px;">

              <!-- Greeting -->
              <h1 class="text-heading" style="margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 600; line-height: 28px; color: #1C1917;">
                Dear ${escapeHtml(contact_person)},
              </h1>

              <!-- Intro Copy -->
              <p class="text-body" style="margin: 0 0 24px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px; color: #3C3734;">
                ${escapeHtml(introCopy)}
              </p>

              ${
                personal_note
                  ? `<!-- Personal Note Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="note-bg" style="margin: 0 0 28px 0; background-color: #FAF8F5; border-left: 4px solid #9A4A2E; border-radius: 4px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9A4A2E; margin-bottom: 6px;">
                      Personal Note
                    </div>
                    <div class="text-body" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 22px; color: #292524; font-style: italic;">
                      &ldquo;${escapeHtml(personal_note)}&rdquo;
                    </div>
                  </td>
                </tr>
              </table>`
                  : ""
              }

              <!-- What to expect: 3-box strip -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #8C4A27;">
                    What to expect
                  </td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <!-- Box 1 -->
                        <td width="31%" valign="top" class="box-bg" style="background-color: #FAF8F5; border: 1px solid #EBE5DF; border-radius: 6px; padding: 14px 10px; text-align: center;">
                          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 700; color: #9A4A2E; margin-bottom: 4px;">1</div>
                          <div class="text-heading" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #1C1917; line-height: 17px;">About 20–30 minutes</div>
                          <div class="text-muted" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: #78716C; margin-top: 4px;">Time to complete</div>
                        </td>
                        <td width="3.5%">&nbsp;</td>
                        <!-- Box 2 -->
                        <td width="31%" valign="top" class="box-bg" style="background-color: #FAF8F5; border: 1px solid #EBE5DF; border-radius: 6px; padding: 14px 10px; text-align: center;">
                          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 700; color: #9A4A2E; margin-bottom: 4px;">2</div>
                          <div class="text-heading" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #1C1917; line-height: 17px;">Save and resume anytime</div>
                          <div class="text-muted" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: #78716C; margin-top: 4px;">Progress autosaves</div>
                        </td>
                        <td width="3.5%">&nbsp;</td>
                        <!-- Box 3 -->
                        <td width="31%" valign="top" class="box-bg" style="background-color: #FAF8F5; border: 1px solid #EBE5DF; border-radius: 6px; padding: 14px 10px; text-align: center;">
                          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 700; color: #9A4A2E; margin-bottom: 4px;">3</div>
                          <div class="text-heading" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #1C1917; line-height: 17px;">Anyone on your team can fill it</div>
                          <div class="text-muted" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: #78716C; margin-top: 4px;">Shareable link</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Bulletproof CTA Button with VML Fallback -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 32px 0;">
                <tr>
                  <td align="center">
                    <div>
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${escapeHtml(invitation_url)}" style="height:50px;v-text-anchor:middle;width:260px;" arcsize="12%" fillcolor="#9A4A2E" stroke="f">
                        <w:anchorlock/>
                        <center style="color:#FFFFFF;font-family:sans-serif;font-size:15px;font-weight:600;">Begin your assessment</center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-- -->
                      <a href="${escapeHtml(invitation_url)}" target="_blank" style="background-color: #9A4A2E; color: #FFFFFF; font-family: sans-serif; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; display: inline-block;">
                        Begin your assessment
                      </a>
                      <!--<![endif]-->
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Keep these handy checklist -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="box-bg" style="margin: 0 0 28px 0; background-color: #FAF8F5; border-radius: 6px; border: 1px solid #EBE5DF;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <div class="text-heading" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #1C1917; margin-bottom: 12px;">
                      Keep these handy before you begin:
                    </div>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td class="text-body" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 22px; color: #44403C;">
                          <div style="margin-bottom: 4px;">&#8226;&nbsp; GST &amp; Udyam certificates</div>
                          <div style="margin-bottom: 4px;">&#8226;&nbsp; Any environmental, social, or craft certificates</div>
                          <div style="margin-bottom: 4px;">&#8226;&nbsp; ESI document (if applicable)</div>
                          <div style="margin-bottom: 4px;">&#8226;&nbsp; Ethics or sourcing policy</div>
                          <div>&#8226;&nbsp; Photos/video of your production process (optional)</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Fallback Link -->
              <p class="text-muted" style="margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 20px; color: #57534E;">
                If the button above does not work, copy and paste this link into your browser:
                <br />
                <a href="${escapeHtml(invitation_url)}" target="_blank" style="color: #9A4A2E; text-decoration: underline; word-break: break-all; font-size: 12px;">
                  ${escapeHtml(invitation_url)}
                </a>
              </p>

              <!-- Expiry Line -->
              <p class="text-muted" style="margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 20px; color: #78716C;">
                This invitation link is valid until ${escapeHtml(formattedExpiry)}.
              </p>

              <!-- Help Line -->
              <p class="text-body" style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 20px; color: #44403C;">
                If at any point you need assistance, reach out to our Impact Lead, Yuvraj, at
                <a href="mailto:${escapeHtml(helpEmail)}" style="color: #9A4A2E; text-decoration: underline;">
                  ${escapeHtml(helpEmail)}
                </a>.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 24px 40px; background-color: #FAF8F5; border-top: 1px solid #EBE5DF;">
              <p class="footer-text" style="margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 600; color: #78716C;">
                Varna Collective &middot; Evidence to Impact
              </p>
              <p class="footer-text" style="margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: #A8A29E; line-height: 16px;">
                Not the right person? Forward this email to a colleague.
              </p>
              <p class="footer-text" style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: #A8A29E; line-height: 16px;">
                You received this because an enterprise assessment was requested by Varna or your client partner.
              </p>
            </td>
          </tr>

        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Plain Text Version
  const textNote = personal_note
    ? `\nPERSONAL NOTE:\n"${personal_note}"\n`
    : "";

  const text = `Invitation: Join the Varna Partner Network — ${enterprise_name}

Dear ${contact_person},

${introCopy}
${textNote}
WHAT TO EXPECT:
1. About 20–30 minutes
2. Save and resume anytime
3. Anyone on your team can fill it

BEGIN YOUR ASSESSMENT:
${invitation_url}

KEEP THESE HANDY:
- GST & Udyam certificates
- Any environmental, social, or craft certificates
- ESI document (if applicable)
- Ethics or sourcing policy
- Photos/video of your production process (optional)

If the button above does not work, copy and paste this link into your browser:
${invitation_url}

This invitation link is valid until ${formattedExpiry}.

If at any point you need assistance, reach out to our Impact Lead, Yuvraj, at ${helpEmail}.

---
Varna Collective · Evidence to Impact
Not the right person? Forward this email to a colleague.
You received this because an enterprise assessment was requested by Varna or your client partner.
`;

  return {
    html,
    text,
    subject,
  };
}

/**
 * Alias for backward and route compatibility.
 */
export const generateInvitationEmail = renderInvitationEmail;
