import express from "express";
import dotenv from "dotenv";
import { encrypt } from "./encryptData.js";
import { encryptWithPublicKey, decryptWithPrivateKey } from "./rsaEncrypt.js";

dotenv.config();
const app = express();
app.use(express.json()); // <-- VERY IMPORTANT

// Test Route
app.get("/", (req, res) => {
  res.send("Encryption Server Running");
});

// RSA Encryption Route
app.post("/rsa/encrypt", (req, res) => {
  try {
    const { plaintext } = req.body;
    if (!plaintext) {
      return res.status(400).json({ success: false, error: "Missing 'plaintext'" });
    }

    const ciphertext = encryptWithPublicKey(plaintext);
    res.json({ success: true, ciphertext });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// RSA Decryption Route
app.post("/rsa/decrypt", (req, res) => {
  try {
    const { ciphertext } = req.body;
    if (!ciphertext) {
      return res.status(400).json({ success: false, error: "Missing 'ciphertext'" });
    }

    const plaintext = decryptWithPrivateKey(ciphertext);
    res.json({ success: true, plaintext });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Encryption server running on port ${PORT}`));
