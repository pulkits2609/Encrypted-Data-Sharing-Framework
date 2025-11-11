
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.DECRYPTION_PORT || 5002;


const ENCRYPTED_DIR = process.env.ENCRYPTED_DIR || path.resolve("../File Server/encrypted");
const DECRYPTED_DIR = process.env.DECRYPTED_DIR || path.resolve("../File Server/decrypted");
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH || "./private.pem";

if (!fs.existsSync(DECRYPTED_DIR)) fs.mkdirSync(DECRYPTED_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ENCRYPTED_DIR),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });


app.post("/decrypt-file", upload.single("file"), (req, res) => {
  try {
    console.log("DEBUG => req.file:", req.file);

    const encryptedFilePath = req.file.path;
    const metaFilePath = encryptedFilePath.replace(/\.enc$/, ".meta.json");

    if (!fs.existsSync(metaFilePath)) {
      return res.status(400).json({ error: "Metadata file not found for this encrypted file" });
    }

    
    const metadata = JSON.parse(fs.readFileSync(metaFilePath, "utf8"));
    const { encryptedAesKey, iv } = metadata;

    const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, "utf8");

    
    const aesKey = crypto.privateDecrypt(
      { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
      Buffer.from(encryptedAesKey, "base64")
    );

    
    const ivBuffer = Buffer.from(iv, "base64");
    const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, ivBuffer);

    const decryptedFileName = req.file.originalname.replace(".enc", "");
    const decryptedFilePath = path.join(DECRYPTED_DIR, decryptedFileName);

    const input = fs.createReadStream(encryptedFilePath);
    const output = fs.createWriteStream(decryptedFilePath);

    input.pipe(decipher).pipe(output);

    output.on("finish", () => {
      console.log(`✅ File decrypted successfully: ${decryptedFilePath}`);
      res.json({
        message: "File decrypted successfully",
        outputFile: decryptedFilePath
      });
    });

  } catch (err) {
    console.error("❌ Error during decryption:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🔓 Decryption Server running on http://localhost:${PORT}`);
  console.log(`ENCRYPTED_DIR = ${ENCRYPTED_DIR}`);
  console.log(`DECRYPTED_DIR = ${DECRYPTED_DIR}`);
  console.log(`PRIVATE_KEY_PATH = ${PRIVATE_KEY_PATH}`);
});
