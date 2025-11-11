// generateKeys.js
import fs from "fs";
import crypto from "crypto";

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048, // 2048-bit key
  publicKeyEncoding: {
    type: "pkcs1",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs1",
    format: "pem",
  },
});

fs.writeFileSync("private.pem", privateKey);
fs.writeFileSync("public.pem", publicKey);

console.log("✅ RSA key pair generated: private.pem & public.pem");
