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

async function sendAdminInvitationEmail({ email, name, token, tempPassword, expiresAt }) {
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/auth/password-setup?token=${token}`;
  
  const html = renderEmailTemplate({
    name,
    actionUrl: loginUrl,
    actionText: 'Initialize Administrative Account',
    heroTitle: 'Official MMIS Administrator Invitation',
    intro: `You have been appointed as an administrator for the MMIS platform. \n\nYour temporary credentials are:\nEmail: ${email}\nPassword: ${tempPassword}`,
    outro: `IMPORTANT SECURITY NOTICE: Your account is currently in a PROVISIONAL state. After setting your permanent password, you must visit a Market Authority personnel physically to complete the Trust-Handshake verification. \n\nThis invitation expires on ${new Date(expiresAt).toLocaleString()}.`,
    ctaTag: 'Secure Enrollment'
  });

  const text = `Admin Invitation: ${loginUrl}\nTemporary Password: ${tempPassword}`;
  
  return await getTransporter().sendMail({
    from: SMTP_FROM || SMTP_USER,
    to: email,
    subject: 'Official Administrative Appointment - MMIS Gateway',
    text,
    html
  });
}

async function sendGenericNotificationEmail(to, title, message, actionUrl = null, options = {}) {
  const { name = 'User', ctaTag = 'System Alert' } = options;
  const html = renderEmailTemplate({
    name,
    actionUrl,
    actionText: 'View Details',
    intro: message,
    heroTitle: title,
    ctaTag: options.ctaTag || 'System Alert'
  });
  const text = `${title}: ${message}${actionUrl ? `\nView here: ${actionUrl}` : ''}`;
  const info = await getTransporter().sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject: title,
    text,
    html,
  });
  return info;
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAdminInvitationEmail,
  sendGenericNotificationEmail
};
