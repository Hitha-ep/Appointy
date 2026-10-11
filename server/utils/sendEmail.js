import nodemailer from 'nodemailer';
import { Resend } from 'resend';

/**
 * Send Email helper using Resend / Brevo HTTP API (Render Cloud safe) or Nodemailer SMTP (Fallback)
 * @param {Object} options { to, subject, html, text }
 */
export const sendEmail = async (options) => {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.replace(/\s+/g, '');
  const resendApiKey = process.env.RESEND_API_KEY?.trim();

  // Extract OTP from HTML for console logging (always shown for easy debugging)
  const match = options.html ? options.html.match(/class="otp-code">(\d{6})<\/div>/) : null;
  const otpCode = match ? match[1] : '';

  // Always log OTP to console so it's never lost
  if (otpCode) {
    console.log('\n=============================================================');
    console.log(`📧 Email to: ${options.to}`);
    console.log(`🔑 [OTP CODE]: ${otpCode}`);
    console.log('=============================================================\n');
  }

  // 1. Resend HTTP API (Recommended for Render Free - bypasses blocked SMTP ports)
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const fromEmail = process.env.RESEND_FROM || 'Appointy <onboarding@resend.dev>';
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (error) {
        console.error(`❌ Resend API error:`, error.message || error);
      } else {
        console.log(`✅ Email sent successfully via Resend API to ${options.to} (ID: ${data.id})`);
        return { success: true, messageId: data.id };
      }
    } catch (resendErr) {
      console.error(`❌ Resend API call failed: ${resendErr.message}`);
    }
  }

  // 2. Brevo HTTP API (Alternative HTTP API, 300 free emails/day)
  if (process.env.BREVO_API_KEY) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY.trim(),
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: 'Appointy Healthcare',
            email: user || 'hithapradeep24@gmail.com',
          },
          to: [{ email: options.to }],
          subject: options.subject,
          htmlContent: options.html,
          textContent: options.text,
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        console.log(`✅ Email sent successfully via Brevo API to ${options.to} (ID: ${resData.messageId})`);
        return { success: true, messageId: resData.messageId };
      } else {
        console.error(`❌ Brevo API error:`, resData);
      }
    } catch (brevoErr) {
      console.error(`❌ Brevo API call failed: ${brevoErr.message}`);
    }
  }

  // 3. Fallback to Gmail SMTP via Nodemailer
  const isConfigured = user && pass && !user.includes('your_email') && !pass.includes('your_gmail');

  if (!isConfigured) {
    console.log(`💡 [DEV MODE] No email credentials set — OTP shown above. Set RESEND_API_KEY or EMAIL_USER & EMAIL_PASS.`);
    return { success: true, mocked: true, otpCode };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Appointy Healthcare" <${user}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${options.to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email send failed to ${options.to}: ${error.message}`);
    console.log(`💡 OTP is still shown above — use it to verify manually during development.`);
    return { success: false, error: error.message, otpCode };
  }
};

/**
 * Generate a clean HTML Email Template for OTP Verification
 * @param {string} otp 6-digit OTP code
 * @param {string} name User's name
 */
export const generateOTPEmailTemplate = (otp, name = 'User') => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Appointy - OTP Verification</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
      .email-container { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
      .header { background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 30px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
      .header p { margin: 6px 0 0; color: rgba(255,255,255,0.85); font-size: 14px; }
      .content { padding: 35px 30px; color: #1e293b; }
      .greeting { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
      .message { font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 25px; }
      .otp-box { background: #eff6ff; border: 2px dashed #2563eb; border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0; }
      .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8; font-family: 'Courier New', Courier, monospace; }
      .expiry-text { font-size: 13px; color: #ef4444; font-weight: 600; margin-top: 8px; }
      .footer { background: #f8fafc; padding: 20px 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      .footer a { color: #2563eb; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>🏥 Appointy</h1>
        <p>Doctor Appointment & Healthcare Platform</p>
      </div>
      <div class="content">
        <div class="greeting">Hello ${name},</div>
        <div class="message">
          Thank you for joining <strong>Appointy</strong>! To complete your registration and verify your email address, please use the 6-digit verification code below:
        </div>
        
        <div class="otp-box">
          <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 6px;">Your Verification Code</div>
          <div class="otp-code">${otp}</div>
          <div class="expiry-text">⏱️ Code expires in 5 minutes</div>
        </div>

        <div class="message" style="font-size: 14px; color: #64748b;">
          If you did not request this registration, please ignore this email or contact our support team.
        </div>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Appointy Healthcare Inc. All rights reserved.<br/>
        Need help? Contact <a href="mailto:support@appointy.com">support@appointy.com</a>
      </div>
    </div>
  </body>
  </html>
  `;
};
