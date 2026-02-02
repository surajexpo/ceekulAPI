const crypto = require('crypto');

/**
 * Generates a unique CeebrainId for users
 * Format: CB-XXXXXX-XXXX (e.g., CB-A7B3C2-1K9M)
 *
 * The ID consists of:
 * - Prefix: "CB-" (CeeBrain)
 * - 6 alphanumeric characters (timestamp-based)
 * - 4 random alphanumeric characters
 */
const generateCeebrainId = async (User) => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars (0,O,1,I)
  let isUnique = false;
  let ceebrainId;

  while (!isUnique) {
    // Generate timestamp-based portion (6 chars)
    const timestamp = Date.now().toString(36).toUpperCase().slice(-6).padStart(6, '0');

    // Generate random portion (4 chars)
    let randomPart = '';
    const randomBytes = crypto.randomBytes(4);
    for (let i = 0; i < 4; i++) {
      randomPart += characters[randomBytes[i] % characters.length];
    }

    ceebrainId = `CB-${timestamp}-${randomPart}`;

    // Check uniqueness in database
    const existing = await User.findOne({ ceebrainId });
    if (!existing) {
      isUnique = true;
    }
  }

  return ceebrainId;
};

/**
 * Simple synchronous version for cases where uniqueness check is done separately
 */
const generateCeebrainIdSync = () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const timestamp = Date.now().toString(36).toUpperCase().slice(-6).padStart(6, '0');

  let randomPart = '';
  const randomBytes = crypto.randomBytes(4);
  for (let i = 0; i < 4; i++) {
    randomPart += characters[randomBytes[i] % characters.length];
  }

  return `CB-${timestamp}-${randomPart}`;
};

module.exports = { generateCeebrainId, generateCeebrainIdSync };
