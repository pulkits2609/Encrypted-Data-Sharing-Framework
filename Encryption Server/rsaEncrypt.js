// rsaEncrypt.js
import fs from "fs";
import crypto from "crypto";

// Read RSA keys
const publicKey = fs.readFileSync("public.pem", "utf8");
const privateKey = fs.readFileSync("private.pem", "utf8");

// Encrypt with public key
export function encryptWithPublicKey(plaintext) {
  const buffer = Buffer.from(plaintext, "utf8");
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString("base64");
}

// Decrypt with private key
export function decryptWithPrivateKey(ciphertext) {
  const buffer = Buffer.from(ciphertext, "base64");
  const decrypted = crypto.privateDecrypt(privateKey, buffer);
  return decrypted.toString("utf8");
}
