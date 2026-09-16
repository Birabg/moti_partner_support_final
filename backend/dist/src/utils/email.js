"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAccountApprovalEmail = exports.sendSharedSupportInboxAlert = exports.sendCustomerAssignmentEmail = exports.sendCaseAssignmentEmail = exports.sendCaseCreationCustomerEmail = exports.sendPasswordResetEmail = exports.triggerAutoCloseEmail = exports.triggerResolutionReminderEmail = exports.triggerResolutionEmail = exports.sendStatusUpdateEmail = exports.sendVerificationEmail = exports.getTransporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const getTransporter = () => {
    return nodemailer_1.default.createTransport({
        host: env_1.ENV.SMTP_HOST,
        port: Number(env_1.ENV.SMTP_PORT),
        secure: Number(env_1.ENV.SMTP_PORT) === 465,
        auth: {
            user: env_1.ENV.SMTP_USER,
            pass: env_1.ENV.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
};
exports.getTransporter = getTransporter;
const sendVerificationEmail = async (toEmail, recipientName, rawTokenOrBaseUrl, userTypeOrToken, maybeUserType) => {
    let rawToken = "";
    let userType = "CUSTOMER";
    let baseUrl = env_1.ENV.FRONTEND_URL || "http://localhost:3000";
    if (typeof rawTokenOrBaseUrl === "string" &&
        /^https?:\/\//.test(rawTokenOrBaseUrl) &&
        typeof userTypeOrToken === "string" &&
        maybeUserType) {
        baseUrl = rawTokenOrBaseUrl;
        rawToken = userTypeOrToken;
        userType = maybeUserType.toUpperCase();
    }
    else if (typeof userTypeOrToken === "string" &&
        (userTypeOrToken.toUpperCase() === "CUSTOMER" || userTypeOrToken.toUpperCase() === "STAFF")) {
        userType = userTypeOrToken.toUpperCase();
        rawToken = typeof rawTokenOrBaseUrl === "string" ? rawTokenOrBaseUrl : "";
    }
    else {
        rawToken = typeof rawTokenOrBaseUrl === "string" ? rawTokenOrBaseUrl : "";
        userType = typeof maybeUserType === "string" && (maybeUserType.toUpperCase() === "CUSTOMER" || maybeUserType.toUpperCase() === "STAFF")
            ? maybeUserType.toUpperCase()
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
        const transporter = (0, exports.getTransporter)();
        await transporter.verify();
        const info = await transporter.sendMail({
            from: env_1.ENV.SMTP_FROM,
            to: toEmail,
            subject: "Verify Your MOTI Support Portal Account",
            html: htmlContent,
        });
        // console.log("SMTP relay response:", {
        //   messageId: info.messageId,
        //   accepted: info.accepted,
        //   rejected: info.rejected,
        //   response: info.response,
        //   envelope: info.envelope,
        // });
        if (info.rejected && info.rejected.length > 0) {
            console.error("SMTP relay rejected these recipients:", info.rejected);
            return false;
        }
        return true;
    }
    catch (error) {
        console.error("Nodemailer dispatch failure caught:", error);
        return false;
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendStatusUpdateEmail = async (input) => {
    const { customerEmail, customerName, caseNumber, caseId, subjectLine, newStatus } = input;
    const FRONTEND_BASE_URL = env_1.ENV.FRONTEND_URL || "http://localhost:3000";
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
        const transporter = (0, exports.getTransporter)();
        await transporter.sendMail({
            from: env_1.ENV.SMTP_FROM || '"MOTI Support System"',
            to: customerEmail,
            subject: `[Update] Case #${caseNumber} Status Changed to ${newStatus}`,
            html: htmlContent,
        });
    }
    catch (error) {
        console.error(`Critical non-blocking failure emitting transaction notification email to ${customerEmail}:`, error);
    }
};
exports.sendStatusUpdateEmail = sendStatusUpdateEmail;
const triggerResolutionEmail = async (caseReport) => {
    const customerEmail = caseReport.customer?.email;
    const customerName = caseReport.customer?.firstName || "Valued Customer";
    if (!customerEmail) {
        console.warn(`[EmailService] Skipped email notice: No email found for customer on case ID ${caseReport.id}`);
        return;
    }
    const FRONTEND_BASE_URL = env_1.ENV.FRONTEND_URL || "http://localhost:3000";
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
    const transporter = (0, exports.getTransporter)();
    await transporter.sendMail({
        from: env_1.ENV.SMTP_FROM || '"MOTI Support System"',
        to: customerEmail,
        subject: emailSubject,
        html: emailHtml,
    });
};
exports.triggerResolutionEmail = triggerResolutionEmail;
const triggerResolutionReminderEmail = async (caseReport) => {
    const customerEmail = caseReport.customer?.email;
    const customerName = caseReport.customer?.firstName || "Valued Customer";
    if (!customerEmail)
        return;
    const FRONTEND_BASE_URL = env_1.ENV.FRONTEND_URL || "http://localhost:3000";
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
    const transporter = (0, exports.getTransporter)();
    await transporter.sendMail({
        from: env_1.ENV.SMTP_FROM || '"MOTI Support System"',
        to: customerEmail,
        subject: `Reminder: Confirm resolution for case #${caseReport.caseNumber}`,
        html,
    });
};
exports.triggerResolutionReminderEmail = triggerResolutionReminderEmail;
const triggerAutoCloseEmail = async (caseReport) => {
    const customerEmail = caseReport.customer?.email;
    const customerName = caseReport.customer?.firstName || "Valued Customer";
    if (!customerEmail)
        return;
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
    const transporter = (0, exports.getTransporter)();
    await transporter.sendMail({
        from: env_1.ENV.SMTP_FROM || '"MOTI Support System"',
        to: customerEmail,
        subject: emailSubject,
        html: emailHtml,
    });
};
exports.triggerAutoCloseEmail = triggerAutoCloseEmail;
const sendPasswordResetEmail = async (toEmail, fullName, rawToken, userType) => {
    const baseUrl = env_1.ENV.FRONTEND_URL || "http://localhost:3000";
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
        const transporter = (0, exports.getTransporter)();
        await transporter.verify();
        const info = await transporter.sendMail({
            from: env_1.ENV.SMTP_FROM,
            to: toEmail,
            subject: "Reset Your MOTI Support Portal Password",
            html: htmlContent,
        });
        if (info.rejected && info.rejected.length > 0) {
            console.error("SMTP relay rejected these recipients:", info.rejected);
            return false;
        }
        return true;
    }
    catch (error) {
        console.error("Nodemailer reset password email dispatch failure:", error);
        return false;
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendCaseCreationCustomerEmail = async (input) => {
    const { customerEmail, customerName, caseNumber, subjectLine, description, isCreatedByStaff, creationReason, } = input;
    const subject = isCreatedByStaff
        ? `[Case #${caseNumber}] Support case created for you: ${subjectLine}`
        : `[Case #${caseNumber}] We Received Your Request: ${subjectLine}`;
    const bodyGreeting = isCreatedByStaff
        ? `<p style="font-size: 14px;">Our support team created a request for you.</p>`
        : `<p style="font-size: 14px;">Thanks for contacting us! We received your message and assigned it ticket number <b>#${caseNumber}</b>.</p>`;
    // const reasonBlock = isCreatedByStaff && creationReason
    //   ? `<p style="font-size: 14px;"><b>Reason Logged:</b> ${creationReason}</p>`
    //   : "";
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
        const transporter = (0, exports.getTransporter)();
        await transporter.sendMail({
            from: env_1.ENV.SMTP_FROM,
            to: customerEmail,
            subject,
            html: htmlContent,
        });
        return true;
    }
    catch (error) {
        console.error("[Email Worker] Failed to send customer case creation receipt:", error);
        return false;
    }
};
exports.sendCaseCreationCustomerEmail = sendCaseCreationCustomerEmail;
// 2. Email function for Assigned Agent
const sendCaseAssignmentEmail = async (input) => {
    const { agentEmail, agentName, caseNumber, subjectLine } = input;
    const baseUrl = env_1.ENV.FRONTEND_URL || "http://localhost:3000";
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
        const transporter = (0, exports.getTransporter)();
        await transporter.sendMail({
            from: env_1.ENV.SMTP_FROM || '"MOTI Support System"',
            to: agentEmail,
            subject: `[New Assignment] Case #${caseNumber}`,
            html: htmlContent,
        });
        return true;
    }
    catch (error) {
        console.error(`Failed to send assignment email to ${agentEmail}:`, error);
        return false;
    }
};
exports.sendCaseAssignmentEmail = sendCaseAssignmentEmail;
// 3. Email function for Customer upon initial assignment
const sendCustomerAssignmentEmail = async (input) => {
    const { customerEmail, customerName, caseNumber } = input;
    const baseUrl = env_1.ENV.FRONTEND_URL || "http://localhost:3000";
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
        const transporter = (0, exports.getTransporter)();
        await transporter.sendMail({
            from: env_1.ENV.SMTP_FROM || '"MOTI Support System"',
            to: customerEmail,
            subject: `[Update] Case #${caseNumber} Assigned to Support Agent`,
            html: htmlContent,
        });
        return true;
    }
    catch (error) {
        console.error(`Failed to send customer assignment email to ${customerEmail}:`, error);
        return false;
    }
};
exports.sendCustomerAssignmentEmail = sendCustomerAssignmentEmail;
const sendSharedSupportInboxAlert = async (input) => {
    const { caseNumber, subjectLine, description, customerName, customerEmail, branchName, creatorName, creationReason, } = input;
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
        const transporter = (0, exports.getTransporter)();
        await transporter.sendMail({
            from: env_1.ENV.SMTP_FROM,
            to: env_1.ENV.SHARED_SUPPORT_INBOX,
            subject: `[New Case #${caseNumber}] ${subjectLine}`,
            html: htmlContent,
        });
        return true;
    }
    catch (error) {
        console.error("[Email Worker] Failed to send shared support inbox alert:", error);
        return false;
    }
};
exports.sendSharedSupportInboxAlert = sendSharedSupportInboxAlert;
const sendAccountApprovalEmail = async (to, fullName, frontendUrl, userType) => {
    try {
        const transporter = (0, exports.getTransporter)();
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
        const info = await transporter.sendMail({
            from: `"${env_1.ENV.SMTP_FROM || "System Admin"}" <${env_1.ENV.SMTP_USER}>`,
            to,
            subject: "Your Account Has Been Approved!",
            html,
        });
        return !!info.messageId;
    }
    catch (error) {
        console.error(`[SMTP ERROR] Failed to send approval email to ${to}:`, error);
        return false;
    }
};
exports.sendAccountApprovalEmail = sendAccountApprovalEmail;
