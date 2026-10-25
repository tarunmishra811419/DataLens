import nodemailer from "nodemailer";

/**
 * Configure Nodemailer transporter based on environment variables.
 * Supports:
 * 1. Gmail service (EMAIL_SERVICE=gmail, EMAIL_USER, EMAIL_PASS)
 * 2. Custom SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE)
 */
function createTransporter() {
    const user = process.env.EMAIL_USER || process.env.SMTP_USER;
    const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

    if (!user || !pass) {
        return null;
    }

    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
            auth: { user, pass },
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 6000,
        });
    }

    // Default to Gmail host
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || "gmail",
        auth: { user, pass },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 6000,
    });
}

/**
 * Generate responsive branded HTML template for OTP verification.
 */
function getOtpHtmlTemplate(otp, name) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DataLens Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #090d16; padding: 40px 10px;">
        <tr>
            <td align="center">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #0c101c; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 36px 20px; border-bottom: 1px solid #1e293b;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td>
                                        <div style="display: inline-block; width: 34px; height: 34px; line-height: 34px; text-align: center; background-color: #2563eb; color: #ffffff; font-weight: 800; font-size: 18px; border-radius: 8px; vertical-align: middle;">D</div>
                                        <span style="vertical-align: middle; margin-left: 10px; font-size: 19px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">DataLens</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 32px 36px;">
                            <h1 style="margin: 0 0 12px; font-size: 22px; font-weight: 700; color: #ffffff;">Verify your identity</h1>
                            <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                                Hello ${name ? name : "there"},<br>
                                Use the 6-digit verification code below to continue with DataLens:
                            </p>

                            <!-- OTP Box -->
                            <div style="background-color: #0f172a; border: 1px solid #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 28px 0;">
                                <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #60a5fa; display: inline-block; padding-left: 8px;">
                                    ${otp}
                                </span>
                            </div>

                            <p style="margin: 0 0 14px; font-size: 13px; color: #64748b; line-height: 1.5;">
                                This code is valid for <strong>10 minutes</strong>. For your security, do not share this code with anyone.
                            </p>

                            <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                                If you did not request this verification code, please disregard this email.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 36px; background-color: #090d16; border-top: 1px solid #1e293b; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #475569;">
                                © ${new Date().getFullYear()} DataLens Analytics Studio. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}

/**
 * Send OTP verification email to recipient.
 * Tries HTTPS APIs first (Resend / Brevo) which work everywhere (including Render free tier).
 * Falls back to Nodemailer SMTP, and if blocked by cloud host, provides safe fallback so registration never breaks.
 */
export async function sendOtpEmail(email, otp, name = "") {
    // 1. Try Brevo HTTPS API first (Port 443 - delivers to ANY email globally without requiring a custom domain)
    if (process.env.BREVO_API_KEY) {
        try {
            const senderEmail =
                process.env.BREVO_SENDER_EMAIL ||
                process.env.EMAIL_USER ||
                process.env.SMTP_USER ||
                "tarunmishra811419@gmail.com";

            const res = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    "api-key": process.env.BREVO_API_KEY,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    sender: { name: "DataLens", email: senderEmail },
                    to: [{ email, name: name || "DataLens User" }],
                    subject: `${otp} is your DataLens verification code`,
                    htmlContent: getOtpHtmlTemplate(otp, name),
                }),
            });
            const data = await res.json();
            if (res.ok && (data.messageId || data.id)) {
                console.log(`[DataLens Auth] Email sent via Brevo API to ${email} (ID: ${data.messageId || data.id})`);
                return { success: true, simulated: false, messageId: data.messageId || data.id };
            }
            console.warn("[DataLens Auth] Brevo API error:", res.status, data);
        } catch (apiErr) {
            console.warn("[DataLens Auth] Brevo API request failed:", apiErr.message);
        }
    }

    // 2. Try Resend HTTPS API (Port 443 - delivers to developer account / verified domains)
    if (process.env.RESEND_API_KEY) {
        try {
            const res = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: process.env.EMAIL_FROM || "DataLens <onboarding@resend.dev>",
                    to: [email],
                    subject: `${otp} is your DataLens verification code`,
                    html: getOtpHtmlTemplate(otp, name),
                }),
            });
            const data = await res.json();
            if (res.ok && data.id) {
                console.log(`[DataLens Auth] Email sent via Resend API to ${email} (ID: ${data.id})`);
                return { success: true, simulated: false, messageId: data.id };
            }
            console.warn("[DataLens Auth] Resend API error:", data);
        } catch (apiErr) {
            console.warn("[DataLens Auth] Resend API request failed:", apiErr.message);
        }
    }

    // 3. Nodemailer SMTP (works in local dev, or paid host)
    const transporter = createTransporter();

    // Fallback if SMTP credentials are not configured in environment
    if (!transporter) {
        console.warn(`[DataLens Auth] No email service configured. Verification code for "${email}": [ ${otp} ]`);
        return {
            success: true,
            simulated: true,
            devOtp: otp,
            message: "Email credentials not configured. Verification code generated.",
        };
    }

    const fromAddress =
        process.env.EMAIL_FROM ||
        `"DataLens" <${process.env.EMAIL_USER || process.env.SMTP_USER}>`;

    const mailOptions = {
        from: fromAddress,
        to: email,
        subject: `${otp} is your DataLens verification code`,
        text: `Your DataLens verification code is: ${otp}. It expires in 10 minutes.`,
        html: getOtpHtmlTemplate(otp, name),
    };

    try {
        const sendPromise = transporter.sendMail(mailOptions);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("SMTP_TIMEOUT")), 5000)
        );

        const info = await Promise.race([sendPromise, timeoutPromise]);
        console.log(`[DataLens Auth] OTP email successfully sent via SMTP to ${email} (ID: ${info.messageId})`);

        return {
            success: true,
            simulated: false,
            messageId: info.messageId,
        };
    } catch (smtpErr) {
        console.warn(
            `\n⚠️ [DataLens Auth] SMTP dispatch failed/timed out (${smtpErr.message}). Render free tier blocks outbound SMTP ports 465/587.`
        );
        console.warn(`👉 [VERIFICATION CODE for ${email}]: [ ${otp} ] (Valid 10 min)\n`);

        return {
            success: true,
            simulated: true,
            devOtp: otp,
            message: "Cloud host blocked outbound SMTP port. Verification code generated.",
        };
    }
}
