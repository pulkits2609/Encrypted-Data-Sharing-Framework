
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.ENCRYPTION_PORT || 5001;

const RAW_DIR = process.env.RAW_DIR || path.resolve("./FileServer/raw");
const ENCRYPTED_DIR = process.env.ENCRYPTED_DIR || path.resolve("./FileServer/encrypted");
const PUBLIC_KEY_PATH = process.env.PUBLIC_KEY_PATH || path.resolve("./public.pem");

fs.mkdirSync(RAW_DIR, { recursive: true });
fs.mkdirSync(ENCRYPTED_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, RAW_DIR),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });


app.get("/", (req, res) => res.json({ ok: true, port: PORT }));


app.post("/encrypt-file", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

  try {
    const uploadedPath = req.file.path;
    const originalName = req.file.originalname;

    if (!fs.existsSync(PUBLIC_KEY_PATH)) {
      return res.status(500).json({ success: false, message: `Public key not found at ${PUBLIC_KEY_PATH}` });
    }

    const publicKey = fs.readFileSync(PUBLIC_KEY_PATH, "utf8");
    const fileBuffer = fs.readFileSync(uploadedPath);

    
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
    const encryptedBuffer = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);

    
    const encryptedAesKey = crypto.publicEncrypt(publicKey, aesKey);

    
    const encryptedFileName = `${originalName}.enc`;
    const encryptedFilePath = path.join(ENCRYPTED_DIR, encryptedFileName);
    fs.writeFileSync(encryptedFilePath, encryptedBuffer);

    
    const metadata = {
      encryptedAesKey: encryptedAesKey.toString("base64"),
      iv: iv.toString("base64"),
      originalFileName: originalName,
      timestamp: new Date().toISOString(),
    };
    const metaFilePath = path.join(ENCRYPTED_DIR, `${originalName}.meta.json`);
    fs.writeFileSync(metaFilePath, JSON.stringify(metadata, null, 2));

    return res.json({
      success: true,
      message: "File encrypted successfully",
      encryptedFilePath,
      metadataFile: metaFilePath,
    });
  } catch (err) {
    console.error("Encryption error:", err);
    return res.status(500).json({ success: false, message: "Encryption failed", error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🔒 Encryption Server running on http://localhost:${PORT}`);
  console.log("RAW_DIR =", RAW_DIR);
  console.log("ENCRYPTED_DIR =", ENCRYPTED_DIR);
  console.log("PUBLIC_KEY_PATH =", PUBLIC_KEY_PATH);
});
