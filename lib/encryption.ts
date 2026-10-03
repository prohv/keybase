import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended by NIST for GCM
const KEY_LENGTH = 32;

/**
 * Gets the encryption key from environment variables.
 * Decodes from base64 and ensures it's 32 bytes.
 */
function getEncryptionKey(): Buffer {
    const keyBase64 = process.env.ENCRYPTION_KEY;
    if (!keyBase64) {
        throw new Error('ENCRYPTION_KEY environment variable is not set');
    }

    const key = Buffer.from(keyBase64, 'base64');
    if (key.length < KEY_LENGTH) {
        throw new Error(`ENCRYPTION_KEY must be at least ${KEY_LENGTH} bytes when decoded from base64 (got ${key.length})`);
    }

    // Use subarray to ensure we get exactly 32 bytes even if the key is messy
    return key.subarray(0, KEY_LENGTH);
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns the encrypted content and the composite IV (iv:authTag) as base64.
 */
export function encrypt(text: string): { encrypted: string; iv: string } {
    try {
        const key = getEncryptionKey();
        const iv = randomBytes(IV_LENGTH);
        const cipher = createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(text, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        const authTag = cipher.getAuthTag();

        return {
            encrypted,
            iv: `${iv.toString('base64')}:${authTag.toString('base64')}`,
        };
    } catch {
        throw new Error('Encryption operation failed');
    }
}

/**
 * Decrypts an encrypted string using AES-256-GCM with authentication verification.
 * Includes backward compatibility for legacy AES-256-CBC ciphertexts.
 */
export function decrypt(encrypted: string, ivString: string): string {
    try {
        const key = getEncryptionKey();

        // AES-256-GCM with authentication tag
        if (ivString.includes(':')) {
            const [ivBase64, authTagBase64] = ivString.split(':');
            const iv = Buffer.from(ivBase64, 'base64');
            const authTag = Buffer.from(authTagBase64, 'base64');

            const decipher = createDecipheriv(ALGORITHM, key, iv);
            decipher.setAuthTag(authTag);

            let decrypted = decipher.update(encrypted, 'base64', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        }

        // Legacy AES-256-CBC fallback
        const iv = Buffer.from(ivString, 'base64');
        const decipher = createDecipheriv('aes-256-cbc', key, iv);

        let decrypted = decipher.update(encrypted, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch {
        throw new Error('Decryption operation failed');
    }
}
