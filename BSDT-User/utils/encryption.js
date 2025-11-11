const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // Get key from .env

/**
 * Encrypts plaintext.
 * @param {string} textToEncrypt The plaintext data
 * @returns {string} A combined string: "iv:authTag:encryptedData"
 */
function encrypt(textToEncrypt) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(textToEncrypt, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();

  // Combine IV, auth tag, and data into one string for storage
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a stored string back into plaintext.
 * @param {string} encryptedText The stored string: "iv:authTag:encryptedData"
 * @returns {string} The original plaintext
 */
function decrypt(encryptedText) {
  try {
    const [ivHex, authTagHex, encryptedDataHex] = encryptedText.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedDataHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error.message);
    return null; // Handle decryption failure gracefully
  }
}

// Make sure to export them
module.exports = { encrypt, decrypt };