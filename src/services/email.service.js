const nodemailer = require('nodemailer');

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
} = process.env;

let transporter;

/**  creating a transporter so the app can boot without SMTP present in some envs */
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: String(SMTP_SECURE).toLowerCase() === 'true', // false for STARTTLS
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendVerificationEmail(to, verifyUrl) {
  const html = `
    <div style="font-family:system-ui,Segoe UI,Arial,sans-serif">
      <h2>Verify your email</h2>
      <p>Thanks for signing up. Click the button below to verify your email address.</p>
      <p>
        <a href="${verifyUrl}"
           style="background:#4f46e5;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block">
           Verify Email
        </a>
      </p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p style="word-break:break-all">${verifyUrl}</p>
      <p style="margin-top:20px;font-size:12px;color:#999;">This link expires in 24 hours.</p>
    </div>
  `;

  const text = `Verify your email: ${verifyUrl}`;

  const info = await getTransporter().sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject: 'Verify your email',
    text,
    html,
  });

  return info;
}

async function sendPasswordResetEmail(to, resetUrl) {
  const html = `
    <div style="font-family:system-ui,Segoe UI,Arial,sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #1e293b; margin-bottom: 16px;">Reset your password</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        We received a request to reset the password for your account. If you didn't make this request, you can safely ignore this email.
      </p>
      <p style="margin-bottom: 32px;">
        <a href="${resetUrl}"
           style="background:#4f46e5;color:#fff;padding: 12px 24px;border-radius:8px;text-decoration:none;display:inline-block;font-weight: bold;font-size: 14px;">
           Reset Password
        </a>
      </p>
      <p style="color: #64748b; font-size: 14px; margin-bottom: 8px;">If the button doesn't work, copy and paste this URL into your browser:</p>
      <p style="word-break:break-all; color: #4f46e5; font-size: 12px;">${resetUrl}</p>
      <p style="margin-top:32px;font-size:12px;color:#94a3b8;border-top: 1px solid #f1f5f9; padding-top: 16px;">
        This link is valid for 1 hour. For your security, please do not share this link with anyone.
      </p>
    </div>
  `;

  const text = `Reset your password: ${resetUrl}`;

  const info = await getTransporter().sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject: 'Reset your password',
    text,
    html,
  });

  return info;
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
