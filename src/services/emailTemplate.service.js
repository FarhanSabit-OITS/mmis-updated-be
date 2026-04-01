// src/services/emailTemplate.service.js
// Utility to load and render the HTML email template with dynamic content using Handlebars

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const templatePath = path.join(__dirname, '../templates/email_template.hbs');
let compiledTemplate = null;

function loadAndCompileTemplate() {
  if (!compiledTemplate) {
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    compiledTemplate = Handlebars.compile(templateSource);
  }
  return compiledTemplate;
}

/**
 * Render the email template with dynamic values using Handlebars
 * @param {Object} options - { name, actionUrl, actionText, intro, outro, ctaTag, heroTitle }
 * @returns {string}
 */
function renderEmailTemplate({
  name = 'User',
  actionUrl = '#',
  actionText = 'Verify Account',
  intro = '',
  outro = '',
  ctaTag = 'Welcome',
  heroTitle = 'Verify Your MMIS Account',
} = {}) {
  const template = loadAndCompileTemplate();
  return template({ name, actionUrl, actionText, intro, outro, ctaTag, heroTitle });
}

module.exports = {
  renderEmailTemplate,
};
