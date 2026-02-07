import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
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
    console.log(`[Encryption] Raw Key length: ${keyBase64.length}, Decoded length: ${key.length}`);

    if (key.length < KEY_LENGTH) {
        throw new Error(`ENCRYPTION_KEY must be at least ${KEY_LENGTH} bytes when decoded from base64 (got ${key.length})`);
    }

    // Use subarray to ensure we get exactly 32 bytes even if the key is messy
    return key.subarray(0, KEY_LENGTH);
}

/**
 * Encrypts a plaintext string using AES-256-CBC.
 * Returns both the encrypted content and the random IV used, both as base64.
 */
export function encrypt(text: string): { encrypted: string; iv: string } {
    try {
        const key = getEncryptionKey();
        const iv = randomBytes(IV_LENGTH);
        const cipher = createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(text, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        return {
            encrypted,
            iv: iv.toString('base64'),
        };
    } catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('Encryption operation failed');
    }
}

/**
 * Decrypts an encrypted string using AES-256-CBC and the provided IV.
 */
export function decrypt(encrypted: string, ivBase64: string): string {
    try {
        const key = getEncryptionKey();
        const iv = Buffer.from(ivBase64, 'base64');

        if (iv.length !== IV_LENGTH) {
            throw new Error('Invalid IV length');
        }

        const decipher = createDecipheriv(ALGORITHM, key, iv);

        let decrypted = decipher.update(encrypted, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Decryption operation failed');
    }
}
