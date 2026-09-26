import nodemailer from "nodemailer";
import { ENV } from "../config/env";

interface StatusEmailInput {
  customerEmail: string;
  customerName: string;
  caseNumber: string;
  caseId?: string;
  subjectLine: string;
  newStatus: string;
}

interface CaseCreationEmailInput {
  customerEmail: string;
  customerName: string;
  caseNumber: string;
  subjectLine: string;
  description: string;
  isCreatedByStaff: boolean;
  creationReason?: string | null;
}

interface SharedInboxEmailInput {
  caseNumber: string;
  subjectLine: string;
  description: string;
  customerName: string;
  customerEmail: string;
  branchName: string;
  creatorName: string;
  creationReason?: string | null;
}

export const getTransporter = () => {
  return nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: Number(ENV.SMTP_PORT),
    secure: Number(ENV.SMTP_PORT) === 465,
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

interface DispatchOptions {
  to: string;
  subject: string;
  html: string;
  kind: string;
  bcc?: string[];
}

/**
 * Shared dispatcher for every email in the system.
 * - Logs a clear success line (recipient, messageId, SMTP response) on delivery.
 * - Logs the exact failure reason if SMTP is misconfigured or the relay rejects.
 * - Throws on failure so callers that await directly are not left silent.
 */
export const dispatchEmail = async ({
  to,
  subject,
  html,
  kind,
  bcc,
}: DispatchOptions) => {
  if (!ENV.SMTP_HOST || !ENV.SMTP_USER || !ENV.SMTP_PASS) {
    const reason = `SMTP not configured (HOST=${ENV.SMTP_HOST || "unset"}, USER=${ENV.SMTP_USER ? "set" : "unset"}, PASS=${ENV.SMTP_PASS ? "set" : "unset"})`;
    console.error(`[Email:${kind}] ABORTED -> ${to} | ${reason}`);
    throw new Error(reason);
  }

  const transporter = getTransporter();
  const info = await transporter.sendMail({
    from: ENV.SMTP_FROM || `"MOTI Support System" <${ENV.SMTP_USER}>`,
    to,
    subject,
    html,
    ...(bcc && bcc.length ? { bcc } : {}),
  });

  const summary = {
    kind,
    to,
    subject,
    messageId: info.messageId || "n/a",
    accepted: info.accepted?.length ?? 0,
    rejected: info.rejected?.length ?? 0,
    pending: info.pending?.length ?? 0,
    response: info.response || "n/a",
  };
  console.log(`[Email:${kind}] SENT -> ${to} | ${JSON.stringify(summary)}`);

  if (info.rejected && info.rejected.length > 0) {
    console.error(`[Email:${kind}] REJECTED -> ${to} | recipients: ${JSON.stringify(info.rejected)} | response: ${info.response}`);
  }

  return info;
};

export const sendVerificationEmail = async (
  toEmail: string,
  recipientName: string,
  rawTokenOrBaseUrl?: string,
  userTypeOrToken?: "CUSTOMER" | "STAFF" | string,
  maybeUserType?: "CUSTOMER" | "STAFF" | string,
): Promise<boolean> => {
  let rawToken = "";
  let userType: "CUSTOMER" | "STAFF" = "CUSTOMER";
  let baseUrl = ENV.FRONTEND_URL || "http://localhost:3000";

  if (
    typeof rawTokenOrBaseUrl === "string" &&
    /^https?:\/\//.test(rawTokenOrBaseUrl) &&
    typeof userTypeOrToken === "string" &&
    maybeUserType
  ) {
    baseUrl = rawTokenOrBaseUrl;
    rawToken = userTypeOrToken;
    userType = maybeUserType.toUpperCase() as "CUSTOMER" | "STAFF";
  } else if (
    typeof userTypeOrToken === "string" &&
    (userTypeOrToken.toUpperCase() === "CUSTOMER" || userTypeOrToken.toUpperCase() === "STAFF")
  ) {
    userType = userTypeOrToken.toUpperCase() as "CUSTOMER" | "STAFF";
    rawToken = typeof rawTokenOrBaseUrl === "string" ? rawTokenOrBaseUrl : "";
  } else {
    rawToken = typeof rawTokenOrBaseUrl === "string" ? rawTokenOrBaseUrl : "";
    userType = typeof maybeUserType === "string" && (maybeUserType.toUpperCase() === "CUSTOMER" || maybeUserType.toUpperCase() === "STAFF")
      ? maybeUserType.toUpperCase() as "CUSTOMER" | "STAFF"
      : "CUSTOMER";
  }

  const verificationUrl = `${baseUrl}/verify-email?token=${rawToken}&type=${userType.toLowerCase()}`;

  const htmlContent = `
    <div style="font-family: sans-serif; color: #334155; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
      <p style="font-size: 16px;">Hello ${recipientName},</p>
      <p style="font-size: 14px;">Thank you for registering. To complete your setup and activate your account email address, please click the verification button below within the next 24 hours:</p>
      
      <table border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
        <tr>
          <td align="center" bgcolor="#5182c4" style="border-radius: 12px;">
            <a href="${verificationUrl}" target="_blank" style="font-size: 14px; font-family: sans-serif; color: #ffffff; text-decoration: none; border-radius: 12px; padding: 12px 32px; border: 1px solid #5182c4; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </td>
        </tr>
      </table>

      <p style="font-size: 12px; color: #64748b; margin-top: 30px;">
        If the button above does not work, copy and paste the link below directly into your web browser:
      </p>
      <p style="font-size: 12px; word-break: break-all;">
        <a href="${verificationUrl}" target="_blank" style="color: #5182c4;">${verificationUrl}</a>
      </p>
    </div>
  `;

  try {
    await dispatchEmail({
      to: toEmail,
      subject: "Verify Your MOTI Support Portal Account",
      html: htmlContent,
      kind: "verification",
    });
    return true;
  } catch (error) {
    console.error("[Email:verification] dispatch failure caught:", error);
    return false;
  }
};

export const sendStatusUpdateEmail = async (input: StatusEmailInput) => {
  const { customerEmail, customerName, caseNumber, caseId, subjectLine, newStatus } =
    input;

  const FRONTEND_BASE_URL = ENV.FRONTEND_URL || "http://localhost:3000";
  const decisionLink = caseId ? `${FRONTEND_BASE_URL}/cases/${caseId}/feedback` : `${FRONTEND_BASE_URL}/track/${caseNumber}`;
  const rejectLink = caseId ? `${FRONTEND_BASE_URL}/cases/${caseId}/reopen` : `${FRONTEND_BASE_URL}/track/${caseNumber}`;
  const frontendTrackingUrl = `${process.env.FRONTEND_APP_URL || "http://localhost:3000"}/track/${caseNumber}`;

  const isResolutionDecisionEmail = newStatus === "RESOLVED" || newStatus === "CUSTOMER_CONFIRMATION";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2c3e50;">Case Update: ${caseNumber}</h2>
      <p>Hello ${customerName},</p>
      <p>The progress status for your recent service ticket, <strong>"${subjectLine}"</strong>, has changed.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0; border-radius: 4px;">
        <strong>New Status:</strong> <span style="color: #2980b9; font-weight: bold;">${newStatus}</span>
      </div>

      ${isResolutionDecisionEmail ? `
        <p>Please confirm whether this resolution is acceptable:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${decisionLink}" style="background-color: #38a169; color: white; padding: 12px 20px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block; margin-right: 10px; margin-bottom: 10px;">ACCEPT</a>
          <a href="${rejectLink}" style="background-color: #e53e3e; color: white; padding: 12px 20px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block; margin-bottom: 10px;">REJECT</a>
        </div>
      ` : `
        <p>You can follow the full lifecycle timeline, status updates, and milestones anytime:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${frontendTrackingUrl}" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Track Case Progress</a>
        </div>
      `}
      
      <p style="font-size: 12px; color: #7f8c8d; margin-top: 30px;">If the button above does not load, copy and paste this address into your browser window:<br>${isResolutionDecisionEmail ? `${decisionLink} / ${rejectLink}` : frontendTrackingUrl}</p>
    </div>
  `;

  try {
    await dispatchEmail({
      to: customerEmail,
      subject: `[Update] Case #${caseNumber} Status Changed to ${newStatus}`,
      html: htmlContent,
      kind: `status-${newStatus}`,
    });
  } catch (error) {
    console.error(
      `Critical non-blocking failure emitting transaction notification email to ${customerEmail}:`,
      error,
    );
  }
};

export const triggerResolutionEmail = async (caseReport: any): Promise<void> => {
  const customerEmail = caseReport.customer?.email;
  const customerName = caseReport.customer?.firstName || "Valued Customer";

  if (!customerEmail) {
    console.warn(`[EmailService] Skipped email notice: No email found for customer on case ID ${caseReport.id}`);
    return;
  }

  const FRONTEND_BASE_URL = ENV.FRONTEND_URL || "http://localhost:3000";

  const acceptAndRateLink = `${FRONTEND_BASE_URL}/cases/${caseReport.id}/feedback`;
  const rejectAndReopenLink = `${FRONTEND_BASE_URL}/cases/${caseReport.id}/reopen`;

  const emailSubject = `Case Resolved: #${caseReport.caseNumber || 'Update'} - ${caseReport.subject}`;

  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #2b6cb0; margin-bottom: 16px;">Your Case Has Been Resolved</h2>
      <p>Hello ${customerName},</p>
      <p>An agent has updated your support ticket and submitted a resolution summary for your review.</p>
      
      <div style="background-color: #f7fafc; border-left: 4px solid #4299e1; padding: 16px; margin: 20px 0; border-radius: 0 4px 4px 0;">
        <strong style="display: block; margin-bottom: 6px; color: #2d3748;">Resolution Summary:</strong>
        <p style="margin: 0; color: #4a5568; font-style: italic; white-space: pre-wrap;">"${caseReport.resolutionSummary}"</p>
      </div>

      <p style="margin-bottom: 24px;">Please take a moment to confirm if this issue is settled to your satisfaction:</p>
      
      <div style="margin-bottom: 24px;">
        <a href="${acceptAndRateLink}" style="background-color: #38a169; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 12px; margin-bottom: 12px;">
          ACCEPT
        </a>
        <a href="${rejectAndReopenLink}" style="background-color: #e53e3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-bottom: 12px;">
          REJECT
        </a>
      </div>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #718096; line-height: 1.5;">
        <strong>Please Note:</strong> If you do not accept or reject this resolution within <strong>3 days</strong>, our system will automatically mark this case file as closed. If you require further help after that point, you will need to open a brand new support case.
      </p>
    </div>
  `;

  await dispatchEmail({
    to: customerEmail,
    subject: emailSubject,
    html: emailHtml,
    kind: "resolved",
  });
};


export const triggerResolutionReminderEmail = async (caseReport: any): Promise<void> => {
  const customerEmail = caseReport.customer?.email;
  const customerName = caseReport.customer?.firstName || "Valued Customer";

  if (!customerEmail) return;

  const FRONTEND_BASE_URL = ENV.FRONTEND_URL || "http://localhost:3000";
  const acceptLink = `${FRONTEND_BASE_URL}/cases/${caseReport.id}/feedback`;
  const rejectLink = `${FRONTEND_BASE_URL}/cases/${caseReport.id}/reopen`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #2b6cb0; margin-bottom: 16px;">Reminder: Please Confirm the Resolution</h2>
      <p>Hello ${customerName},</p>
      <p>We resolved your case regarding <strong>"${caseReport.subject}"</strong> and are still waiting for your response.</p>
      <p>Please review the resolution summary and choose one of the options below:</p>
      <div style="margin: 24px 0;">
        <a href="${acceptLink}" style="background-color: #38a169; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 12px; margin-bottom: 12px;">ACCEPT</a>
        <a href="${rejectLink}" style="background-color: #e53e3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-bottom: 12px;">REJECT</a>
      </div>
      <p style="font-size: 12px; color: #718096; line-height: 1.5;">If you do not respond, the system will automatically close the case after the remaining confirmation window.</p>
    </div>
  `;

  await dispatchEmail({
    to: customerEmail,
    subject: `Reminder: Confirm resolution for case #${caseReport.caseNumber}`,
    html,
    kind: "resolution-reminder",
  });
};

export const triggerAutoCloseEmail = async (caseReport: any): Promise<void> => {
  const customerEmail = caseReport.customer?.email;
  const customerName = caseReport.customer?.firstName || "Valued Customer";

  if (!customerEmail) return;

  const emailSubject = `Notice: Case #${caseReport.caseNumber || "Update"} has been closed automatically`;

  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #4a5568; margin-bottom: 16px;">Case Closed Due to Inactivity</h2>
      <p>Hello ${customerName},</p>
      <p>We resolved your case regarding <strong>"${caseReport.subject}"</strong>, but we did not receive your response.</p>
      <p>Since you did not take any action, we closed the case.</p>
      
      <div style="background-color: #fffaf0; border-left: 4px solid #dd6b20; padding: 16px; margin: 20px 0; border-radius: 0 4px 4px 0;">
        <p style="margin: 0; color: #dd6b20; font-weight: bold;">Need to continue working on this issue?</p>
        <p style="margin: 4px 0 0 0; color: #7b341e;">Please initialize a new support case report from your dashboard.</p>
      </div>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #a0aec0; text-align: center;">Thank you for choosing our services.</p>
    </div>
  `;

  await dispatchEmail({
    to: customerEmail,
    subject: emailSubject,
    html: emailHtml,
    kind: "auto-close",
  });
};

export const sendPasswordResetEmail = async (
  toEmail: string,
  fullName: string,
  rawToken: string,
  userType: "CUSTOMER" | "STAFF",
): Promise<boolean> => {
  const baseUrl = ENV.FRONTEND_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${rawToken}&type=${userType.toLowerCase()}`;

  const htmlContent = `
    <div style="font-family: sans-serif; color: #334155; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
      <p style="font-size: 16px;">Hello ${fullName},</p>
      <p style="font-size: 14px;">We received a request to reset your password for your MOTI Support Portal account. Click the button below to choose a new password (this link expires in 15 minutes):</p>
      
      <table border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
        <tr>
          <td align="center" bgcolor="#5182c4" style="border-radius: 12px;">
            <a href="${resetUrl}" target="_blank" style="font-size: 14px; font-family: sans-serif; color: #ffffff; text-decoration: none; border-radius: 12px; padding: 12px 32px; border: 1px solid #5182c4; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </td>
        </tr>
      </table>

      <p style="font-size: 12px; color: #64748b; margin-top: 30px;">
        If you did not request a password reset, you can safely ignore this email.
      </p>
      <p style="font-size: 12px; color: #64748b;">
        Or copy and paste this link into your browser:
      </p>
      <p style="font-size: 12px; word-break: break-all;">
        <a href="${resetUrl}" target="_blank" style="color: #5182c4;">${resetUrl}</a>
      </p>
    </div>
  `;

  try {
    await dispatchEmail({
      to: toEmail,
      subject: "Reset Your MOTI Support Portal Password",
      html: htmlContent,
      kind: "password-reset",
    });
    return true;
  } catch (error) {
    console.error("[Email:password-reset] dispatch failure caught:", error);
    return false;
  }
};

export const sendCaseCreationCustomerEmail = async (
  input: CaseCreationEmailInput
): Promise<boolean> => {
  const {
    customerEmail,
    customerName,
    caseNumber,
    subjectLine,
    description,
    isCreatedByStaff,
    creationReason,
  } = input;

  const subject = isCreatedByStaff
    ? `[Case #${caseNumber}] Support case created for you: ${subjectLine}`
    : `[Case #${caseNumber}] We Received Your Request: ${subjectLine}`;

  const bodyGreeting = isCreatedByStaff
    ? `<p style="font-size: 14px;">Our support team created a request for you.</p>`
    : `<p style="font-size: 14px;">Thanks for contacting us! We received your message and assigned it ticket number <b>#${caseNumber}</b>.</p>`;

  const htmlContent = `
    <div style="font-family: sans-serif; color: #334155; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
      <p style="font-size: 16px;">Hello ${customerName},</p>
      ${bodyGreeting}
      <div style="background-color: #f8fafc; border-left: 4px solid #5182c4; padding: 12px 16px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px;"><b>Case Number:</b> #${caseNumber}</p>
        <p style="margin: 4px 0 0; font-size: 14px;"><b>Subject:</b> ${subjectLine}</p>
      </div>
      <p style="font-size: 14px;"><b>Description:</b></p>
      <p style="font-size: 14px; color: #475569;">${description}</p>
      <p style="font-size: 14px; margin-top: 24px;">Our support team is reviewing your request and will follow up with updates shortly.</p>
    </div>
  `;

  try {
    await dispatchEmail({
      to: customerEmail,
      subject,
      html: htmlContent,
      kind: "case-created",
    });
    return true;
  } catch (error) {
    console.error("[Email:case-created] Failed to send customer case creation receipt:", error);
    return false;
  }
};


// 1. Interfaces for Email Inputs
interface CaseAssignmentEmailInput {
  agentEmail: string;
  agentName: string;
  caseNumber: string;
  subjectLine?: string;
}

interface CustomerAssignmentEmailInput {
  customerEmail: string;
  customerName: string;
  caseNumber: string;
}

// 2. Email function for Assigned Agent
export const sendCaseAssignmentEmail = async (
  input: CaseAssignmentEmailInput
): Promise<boolean> => {
  const { agentEmail, agentName, caseNumber, subjectLine } = input;
  const baseUrl = ENV.FRONTEND_URL || "http://localhost:3000";
  const caseUrl = `${baseUrl}/cases/${caseNumber}`;

  const htmlContent = `
    <div style="font-family: sans-serif; color: #334155; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
      <p style="font-size: 16px;">Hello ${agentName},</p>
      <p style="font-size: 14px;">You have been assigned to handle support ticket <strong>#${caseNumber}</strong>${subjectLine ? `: "${subjectLine}"` : ''}.</p>
      
      <table border="0" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
        <tr>
          <td align="center" bgcolor="#5182c4" style="border-radius: 8px;">
            <a href="${caseUrl}" target="_blank" style="font-size: 14px; font-family: sans-serif; color: #ffffff; text-decoration: none; border-radius: 8px; padding: 10px 24px; display: inline-block; font-weight: bold;">
              View Case File
            </a>
          </td>
        </tr>
      </table>

      <p style="font-size: 12px; color: #64748b;">Please log in to your staff portal to review and manage this case.</p>
    </div>
  `;

  try {
    await dispatchEmail({
      to: agentEmail,
      subject: `[New Assignment] Case #${caseNumber}`,
      html: htmlContent,
      kind: "agent-assigned",
    });
    return true;
  } catch (error) {
    console.error(`Failed to send assignment email to ${agentEmail}:`, error);
    return false;
  }
};

// 3. Email function for Customer upon initial assignment
export const sendCustomerAssignmentEmail = async (
  input: CustomerAssignmentEmailInput
): Promise<boolean> => {
  const { customerEmail, customerName, caseNumber } = input;
  const baseUrl = ENV.FRONTEND_URL || "http://localhost:3000";
  const trackingUrl = `${baseUrl}/track/${caseNumber}`;

  const htmlContent = `
    <div style="font-family: sans-serif; color: #334155; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
      <p style="font-size: 16px;">Hello ${customerName},</p>
      <p style="font-size: 14px;">Your support request <strong>#${caseNumber}</strong> has been assigned to an agent and is currently in progress.</p>
      
      <div style="text-align: center; margin: 25px 0;">
        <a href="${trackingUrl}" style="background-color: #5182c4; color: white; padding: 10px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">
          Track Progress
        </a>
      </div>
    </div>
  `;

  try {
    await dispatchEmail({
      to: customerEmail,
      subject: `[Update] Case #${caseNumber} Assigned to Support Agent`,
      html: htmlContent,
      kind: "customer-assigned",
    });
    return true;
  } catch (error) {
    console.error(`Failed to send customer assignment email to ${customerEmail}:`, error);
    return false;
  }
};


 export const sendSharedSupportInboxAlert = async (
  input: SharedInboxEmailInput
): Promise<boolean> => {
  const {
    caseNumber,
    subjectLine,
    description,
    customerName,
    customerEmail,
    branchName,
    creatorName,
    creationReason,
  } = input;

  const htmlContent = `
    <div style="font-family: sans-serif; color: #334155; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1e293b; margin-bottom: 8px;">New Case Alert</h2>
      <p style="font-size: 14px; color: #64748b;">A new support case is awaiting review and assignment to a support agent.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />

      <ul style="padding-left: 20px; font-size: 14px;">
        <li><b>Case Number:</b> #${caseNumber}</li>
        <li><b>Logged By:</b> ${creatorName}</li>
        <li><b>Customer:</b> ${customerName} (${customerEmail})</li>
        <li><b>Branch:</b> ${branchName}</li>
        <li><b>Subject:</b> ${subjectLine}</li>
        ${creationReason ? `<li><b>Reason Logged:</b> ${creationReason}</li>` : ""}
      </ul>

      <h4 style="margin-bottom: 8px;">Issue Description:</h4>
      <p style="background-color: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 14px;">${description}</p>
    </div>
  `;

  try {
    await dispatchEmail({
      to: ENV.SHARED_SUPPORT_INBOX || "",
      subject: `[New Case #${caseNumber}] ${subjectLine}`,
      html: htmlContent,
      kind: "shared-inbox",
    });
    return true;
  } catch (error) {
    console.error("[Email:shared-inbox] Failed to send shared support inbox alert:", error);
    return false;
  }
};


export const sendAccountApprovalEmail = async (
  to: string,
  fullName: string,
  frontendUrl: string,
  userType: "STAFF" | "CUSTOMER"
): Promise<boolean> => {
  try {
    const loginUrl = `${frontendUrl}/login`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Account Approved!</h2>
        <p>Hello <strong>${fullName}</strong>,</p>
        <p>Your <strong>${userType}</strong> account registration has been reviewed and approved by our system administrator.</p>
        <p>You can now log in and access your portal features.</p>
        <div style="margin: 25px 0;">
          <a href="${loginUrl}" 
             style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Log In to Your Account
          </a>
        </div>
        <p style="font-size: 13px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
          If you did not request this account, please ignore this email or contact support immediately.
        </p>
      </div>
    `;

    await dispatchEmail({
      to,
      subject: "Your Account Has Been Approved!",
      html,
      kind: "account-approved",
    });

    return true;
  } catch (error) {
    console.error(`[SMTP ERROR] Failed to send approval email to ${to}:`, error);
    return false;
  }
};

interface StaffCaseUpdateEmailInput {
  staffEmail: string;
  staffName: string;
  caseNumber: string;
  caseId: string;
  subjectLine: string;
  updateType: "status_change" | "resolution" | "closure" | "reassignment" | "priority_change" | "escalation" | "note_added";
  newStatus?: string;
  previousStatus?: string;
  updatedBy: string;
  updateDetails?: string;
  caseUrl: string;
}

export const sendStaffCaseUpdateEmail = async (
  input: StaffCaseUpdateEmailInput
): Promise<boolean> => {
  const {
    staffEmail,
    staffName,
    caseNumber,
    caseId,
    subjectLine,
    updateType,
    newStatus,
    previousStatus,
    updatedBy,
    updateDetails,
    caseUrl,
  } = input;

  const updateTypeLabels: Record<string, string> = {
    status_change: "Status Updated",
    resolution: "Case Resolved",
    closure: "Case Closed",
    reassignment: "Case Reassigned",
    priority_change: "Priority Changed",
    escalation: "Case Escalated",
    note_added: "Note Added",
  };

  const updateTypeLabel = updateTypeLabels[updateType] || "Case Updated";

  const statusColors: Record<string, string> = {
    OPEN: "#3498db",
    ASSIGNED: "#3498db",
    IN_PROGRESS: "#f39c12",
    PENDING: "#9b59b6",
    ESCALATED: "#e74c3c",
    RESOLVED: "#27ae60",
    CLOSED: "#2c3e50",
    CANCELLED: "#95a5a6",
    CUSTOMER_CONFIRMATION: "#27ae60",
  };

  const statusColor = newStatus ? statusColors[newStatus] || "#3498db" : "#3498db";

  let statusHtml = "";
  if (newStatus && previousStatus) {
    statusHtml = `
      <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid ${statusColor}; margin: 20px 0; border-radius: 4px;">
        <strong>Status Changed:</strong> 
        <span style="color: ${statusColor}; font-weight: bold; margin-left: 8px;">${previousStatus} → ${newStatus}</span>
      </div>
    `;
  } else if (newStatus) {
    statusHtml = `
      <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid ${statusColor}; margin: 20px 0; border-radius: 4px;">
        <strong>New Status:</strong> 
        <span style="color: ${statusColor}; font-weight: bold; margin-left: 8px;">${newStatus}</span>
      </div>
    `;
  }

  const detailsHtml = updateDetails
    ? `
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>Details:</strong>
        <p style="margin: 8px 0 0; font-style: italic; color: #856404;">${updateDetails}</p>
      </div>
    `
    : "";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2c3e50;">${updateTypeLabel}: Case #${caseNumber}</h2>
      <p>Hello ${staffName},</p>
      <p>An update has been made to support ticket <strong>"${subjectLine}"</strong> (Case #${caseNumber}).</p>
      
      ${statusHtml}
      ${detailsHtml}

      <p>You can review the full case details and take action if needed:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${caseUrl}" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">View Case</a>
      </div>

      <p style="font-size: 12px; color: #7f8c8d; margin-top: 30px;">
        Updated by: ${updatedBy}<br>
        If the button above does not load, copy and paste this address into your browser: ${caseUrl}
      </p>
    </div>
  `;

  try {
    await dispatchEmail({
      to: staffEmail,
      subject: `[Staff Update] Case #${caseNumber} - ${updateTypeLabel}`,
      html: htmlContent,
      kind: `staff-${updateType}`,
    });
    return true;
  } catch (error) {
    console.error(`[Email:staff-${updateType}] Failed to send staff case update email to ${staffEmail}:`, error);
    return false;
  }
};