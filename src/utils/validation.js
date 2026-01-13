/**
 * Validation utilities for registration and auth
 * These are helper functions used in the auth controller
 */

/**
 * Validate email format using regex
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength and length
 * Requirements: 8-64 characters (allow any characters, including spaces)
 * @param {string} password - Password to validate
 * @returns {boolean} - True if valid password
 */
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 8 && password.length <= 64;
};

/**
 * Normalize email (trim + lowercase)
 * @param {string} email - Raw email input
 * @returns {string} - Normalized email
 */
const normalizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
};

/**
 * Normalize name fields (trim spaces)
 * @param {string} name - Raw name input
 * @returns {string} - Trimmed name
 */
const normalizeName = (name) => {
  if (typeof name !== 'string') return '';
  return name.trim();
};

/**
 * Validate firstName field
 * @param {string} firstName - First name to validate
 * @returns {object} - { isValid: boolean, error: string | null }
 */
const validateFirstName = (firstName) => {
  if (!firstName) {
    return { isValid: false, error: 'firstName is required' };
  }
  if (typeof firstName !== 'string') {
    return { isValid: false, error: 'firstName must be a string' };
  }
  const trimmed = firstName.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: 'firstName cannot be empty or whitespace only' };
  }
  if (trimmed.length > 100) {
    return { isValid: false, error: 'firstName must be 100 characters or less' };
  }
  return { isValid: true, error: null };
};

/**
 * Validate lastName field
 * @param {string} lastName - Last name to validate
 * @returns {object} - { isValid: boolean, error: string | null }
 */
const validateLastName = (lastName) => {
  if (!lastName) {
    return { isValid: false, error: 'lastName is required' };
  }
  if (typeof lastName !== 'string') {
    return { isValid: false, error: 'lastName must be a string' };
  }
  const trimmed = lastName.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: 'lastName cannot be empty or whitespace only' };
  }
  if (trimmed.length > 100) {
    return { isValid: false, error: 'lastName must be 100 characters or less' };
  }
  return { isValid: true, error: null };
};

/**
 * Validate registration request body
 * @param {object} body - Request body
 * @returns {object} - { isValid: boolean, errors: string[] }
 */
const validateRegistrationRequest = (body) => {
  const errors = [];

  // Required fields check
  if (!body.firstName) errors.push('firstName is required');
  if (!body.lastName) errors.push('lastName is required');
  if (!body.email) errors.push('email is required');
  if (!body.password) errors.push('password is required');

  // Format validation
  if (body.email && !validateEmail(body.email)) {
    errors.push('Invalid email format');
  }

  if (body.password && !validatePassword(body.password)) {
    errors.push('Password must be between 8 and 64 characters');
  }

  if (body.firstName && body.firstName.trim().length === 0) {
    errors.push('firstName cannot be empty or whitespace only');
  }

  if (body.lastName && body.lastName.trim().length === 0) {
    errors.push('lastName cannot be empty or whitespace only');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate email verification request
 * @param {string} token - Verification token
 * @returns {object} - { isValid: boolean, errors: string[] }
 */
const validateVerificationRequest = (token) => {
  const errors = [];

  if (!token) {
    errors.push('Verification token is required');
  }

  if (token && typeof token !== 'string') {
    errors.push('Token must be a string');
  }

  // Token should be 64 hex characters (32 bytes)
  if (token && !/^[a-f0-9]{64}$/.test(token)) {
    errors.push('Invalid token format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate login request
 * @param {object} body - Request body
 * @returns {object} - { isValid: boolean, errors: string[] }
 */
const validateLoginRequest = (body) => {
  const errors = [];

  if (!body.email) errors.push('email is required');
  if (!body.password) errors.push('password is required');

  if (body.email && !validateEmail(body.email)) {
    errors.push('Invalid email format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  normalizeEmail,
  normalizeName,
  validateFirstName,
  validateLastName,
  validateRegistrationRequest,
  validateVerificationRequest,
  validateLoginRequest,
};
