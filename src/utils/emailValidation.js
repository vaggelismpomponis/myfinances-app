/**
 * List of common disposable email domains to block.
 * This list is curated to include the most popular temporary email services.
 */
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'yopmail.com',
  'guerrillamail.com',
  'temp-mail.org',
  '10minutemail.com',
  'dispostable.com',
  'getairmail.com',
  'sharklasers.com',
  'guerrillamailblock.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'spam4.me',
  'grr.la',
  'guerrillamail.de',
  'trashmail.com',
  'disposable.com',
  'fakeinbox.com',
  'maildrop.cc',
  'mintemail.com',
  'mytemp.email',
  'tempmail.com',
  'temp-mail.ru',
  'tempmailaddress.com',
  'tempmail.net',
  'tempmail.org',
  'tempmail.co',
  'tempmail.id',
  'tempmail.pw',
  'tempmail.us',
  'tempmail.me',
  'temp-mail.io',
  'temp-mail.com',
  '1secmail.com',
  '1secmail.net',
  '1secmail.org',
  'mail-temp.com',
  'emlpro.com',
  'emltmp.com',
  'laste.ml',
  'spymail.one',
  'burnemail.com',
  'disposablemail.com',
  'throwawaymail.com',
  'temp-mail.net',
  'temp-mail.today',
  'temp-mail.email',
  'temp-mail.link',
  'temp-mail.live',
  'temp-mail.pro',
  'temp-mail.vip'
]);

/**
 * Validates if an email address is from a known disposable provider.
 * @param {string} email - The email address to check.
 * @returns {boolean} - Returns true if the email is disposable, false otherwise.
 */
export const isDisposableEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  const domain = email.trim().split('@')[1];
  if (!domain) return false;
  
  return DISPOSABLE_DOMAINS.has(domain.toLowerCase());
};

/**
 * Performs comprehensive email validation.
 * @param {string} email - The email address to validate.
 * @returns {{isValid: boolean, errorKey?: string}}
 */
export const validateEmail = (email) => {
  const trimmedEmail = email.trim();
  
  // Basic format check
  const formatRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formatRegex.test(trimmedEmail)) {
    return { isValid: false, errorKey: 'invalid_email_format' };
  }
  
  // Disposable check
  if (isDisposableEmail(trimmedEmail)) {
    return { isValid: false, errorKey: 'disposable_email_blocked' };
  }
  
  return { isValid: true };
};
