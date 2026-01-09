const crypto = require('crypto');
const e = require('express');

function generateSlug() {
  // Generate 3 random bytes (which becomes 6 Hex characters)
  const buffer = crypto.randomBytes(3);
  const token = buffer.toString('hex'); 
  
  // Format as 3-3 (e.g., "a1f-4b9")
  return `${token.slice(0, 3)}-${token.slice(3, 6)}`;
}

exports.generateSlug = generateSlug;