import brevoClient from "../config/brevo.js";

import {
  createEmailLog,
  updateEmailStatus
} from "../models/emailLog.model.js";

/**
 * Create an email log manually.
 */
export async function logEmail({
  userId = null,
  recipientEmail,
  emailType,
  brevoMessageId = null,
  deliveryStatus = "pending",
  failureReason = null,
  sentAt = null,
  deliveredAt = null
}) {
  return createEmailLog({
    userId,
    recipientEmail,
    emailType,
    brevoMessageId,
    deliveryStatus,
    failureReason,
    sentAt,
    deliveredAt
  });
}

/**
 * Mark an email as accepted by Brevo.
 */
export async function markEmailSent(
  emailLogId,
  brevoMessageId
) {
  return updateEmailStatus(
    emailLogId,
    "sent",
    {
      brevoMessageId,
      sentAt: new Date()
    }
  );
}

/**
 * Mark an email as delivered.
 *
 * This will generally be called later through
 * a Brevo webhook.
 */
export async function markEmailDelivered(emailLogId) {
  return updateEmailStatus(
    emailLogId,
    "delivered",
    {
      deliveredAt: new Date()
    }
  );
}

/**
 * Mark an email as failed.
 */
export async function markEmailFailed(
  emailLogId,
  reason
) {
  return updateEmailStatus(
    emailLogId,
    "failed",
    {
      failureReason: reason
    }
  );
}

/**
 * Send any transactional email through Brevo.
 */
export async function sendTransactionalEmail({
  userId = null,
  recipientEmail,
  recipientName = null,
  emailType,
  subject,
  htmlContent,
  textContent = null
}) {
  const emailLog = await createEmailLog({
    userId,
    recipientEmail,
    emailType,
    deliveryStatus: "pending"
  });

  try {
    const result =
      await brevoClient.transactionalEmails.sendTransacEmail({
        sender: {
          name: process.env.BREVO_SENDER_NAME || "UNWIND",
          email: process.env.BREVO_SENDER_EMAIL
        },

        to: [
          {
            email: recipientEmail,
            ...(recipientName
              ? { name: recipientName }
              : {})
          }
        ],

        subject,
        htmlContent,

        ...(textContent
          ? { textContent }
          : {})
      });

    await markEmailSent(
      emailLog.email_log_id,
      result.messageId
    );

    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    const failureReason =
      error?.body?.message ||
      error?.response?.body?.message ||
      error?.message ||
      "Email delivery failed";

    await markEmailFailed(
      emailLog.email_log_id,
      failureReason
    );

    throw error;
  }
}

/**
 * Send one email containing both:
 * - verification OTP
 * - verification link
 */
export async function sendVerificationEmail({
  userId,
  recipientEmail,
  recipientName = null,
  otp,
  verificationToken
}) {
  const verificationUrl =
  `${process.env.FRONTEND_URL}/verify-email` +
  `?userId=${encodeURIComponent(userId)}` +
  `&token=${encodeURIComponent(verificationToken)}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
      </head>

      <body
        style="
          margin: 0;
          padding: 30px;
          background-color: #f5f7fb;
          font-family: Arial, sans-serif;
          color: #242424;
        "
      >
        <div
          style="
            max-width: 600px;
            margin: 0 auto;
            padding: 32px;
            background-color: #ffffff;
            border-radius: 12px;
          "
        >
          <h2 style="margin-top: 0;">
            Verify your UNWIND account
          </h2>

          <p>
            ${
              recipientName
                ? `Hello ${recipientName},`
                : "Hello,"
            }
          </p>

          <p>
            Enter this OTP to verify your email address:
          </p>

          <div
            style="
              margin: 28px 0;
              padding: 16px;
              text-align: center;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              background-color: #f2effa;
              border-radius: 8px;
            "
          >
            ${otp}
          </div>

          <p>
            You can also verify your email using the
            button below.
          </p>

          <div
            style="
              margin: 30px 0;
              text-align: center;
            "
          >
            <a
              href="${verificationUrl}"
              style="
                display: inline-block;
                padding: 13px 24px;
                background-color: #6750a4;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
              "
            >
              Verify Email
            </a>
          </div>

          <p>
            The OTP expires in 10 minutes. The verification
            link expires in 30 minutes.
          </p>

          <p>
            If you did not create an UNWIND account, you can
            ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;

  const textContent = `
Verify your UNWIND account.

Your verification OTP is: ${otp}

You can also verify your email using this link:
${verificationUrl}

The OTP expires in 10 minutes.
The verification link expires in 30 minutes.

If you did not create this account, ignore this email.
  `.trim();

  return sendTransactionalEmail({
    userId,
    recipientEmail,
    recipientName,
    emailType: "email_verification",
    subject: "Verify your UNWIND email address",
    htmlContent,
    textContent
  });
}