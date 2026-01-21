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

module.exports = {
  sendVerificationEmail,
};
