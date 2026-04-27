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

const { renderEmailTemplate } = require('./emailTemplate.service');

async function sendVerificationEmail(to, verifyUrl, options = {}) {
  const { name = 'User' } = options;
  const html = renderEmailTemplate({
    name,
    actionUrl: verifyUrl,
    actionText: 'Verify Account',
    intro: 'Thanks for signing up. Click the button below to verify your email address.',
    outro: "If the button doesn't work, copy and paste this URL into your browser:",
    ctaTag: 'Welcome',
    heroTitle: 'Verify Your MMIS Account',
  });
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

async function sendPasswordResetEmail(to, resetUrl, options = {}) {
  const { name = 'User' } = options;
  const html = renderEmailTemplate({
    name,
    actionUrl: resetUrl,
    actionText: 'Reset Password',
    intro: 'We received a request to reset the password for your account. If you didn\'t make this request, you can safely ignore this email.',
    outro: "If the button doesn't work, copy and paste this URL into your browser:",
    ctaTag: 'Password Reset',
    heroTitle: 'Reset Your MMIS Password',
  });
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

async function sendSystemEmail({ to, subject, intro, actionUrl, actionText, outro, name = 'User', ctaTag = 'MMIS', heroTitle = 'MarketMaster Notification' }) {
  const html = renderEmailTemplate({
    name,
    actionUrl,
    actionText,
    intro,
    outro,
    ctaTag,
    heroTitle,
  });
  const textParts = [intro, actionUrl, outro].filter(Boolean);
  const info = await getTransporter().sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject,
    text: textParts.join('\n\n'),
    html,
  });
  return info;
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendSystemEmail,
};
