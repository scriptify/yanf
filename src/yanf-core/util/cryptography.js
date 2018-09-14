import argon2 from 'argon2';

/**
 * Takes a plain password and creates a secure argon2 hash out of it
 * @param {string} password
 */
export async function hashPassword(password) {
  const passwordHash = await argon2.hash(password, { type: argon2.argon2i });
  return passwordHash;
}

/**
 * Verify the password with the password hash
 * @param {string} hash
 */
export function verifyPassword({ hash, password }) {
  return argon2.verify(hash, password);
}
