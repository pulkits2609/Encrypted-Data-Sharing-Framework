
import crypto from "crypto";

const ALGORITHM = "aes-256-cbc"; // AES-256 in CBC mode
const KEY_ENV_NAME = "ENCRYPTION_KEY_BASE64";

/**
 * Returns a Buffer key (32 bytes) from environment variable.
 * Throws helpful errors if key missing or wrong length.
 */
function getKeyBuffer() {
  const keyB64 = process.env[KEY_ENV_NAME];
  if (!keyB64) {
    throw new Error(`${KEY_ENV_NAME} not set in environment (.env missing or dotenv not configured)`);
  }
  const key = Buffer.from(keyB64, "base64");
  if (key.length !== 32) {
    throw new Error(`${KEY_ENV_NAME} must decode to 32 bytes (256 bits). Current length: ${key.length}`);
  }
  return key;
}

/**
 * Encrypts plaintext string.
 * Returns { iv: base64, ciphertext: base64 }
 */
export function encrypt(plaintext) {
  if (typeof plaintext !== "string") {
    throw new Error("Plaintext must be a string");
  }
  const key = getKeyBuffer();
  const iv = crypto.randomBytes(16); // 16 bytes for AES block size
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  return {
    iv: iv.toString("base64"),
    ciphertext: encrypted
  };
}

/**
 * Decrypts base64 iv and base64 ciphertext to plaintext.
 * Exported mainly for local testing. Your teammate may implement their own decryption server.
 */
export function decrypt(ivBase64, ciphertextBase64) {
  const key = getKeyBuffer();
  const iv = Buffer.from(ivBase64, "base64");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  let decrypted = decipher.update(ciphertextBase64, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
