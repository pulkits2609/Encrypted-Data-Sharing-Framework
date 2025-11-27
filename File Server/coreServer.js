// fileServer.js (CLEANED + ULTRA LOGGING + ASCII-ONLY)

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();

app.use(express.json());

// ======================================================
// BASE DIRECTORY
// ======================================================
const BASE_DIR = path.join(__dirname, "team_files");

if (!fs.existsSync(BASE_DIR)) {
  fs.mkdirSync(BASE_DIR);
  console.log("Created base directory:", BASE_DIR);
}

// ======================================================
// MULTER
// ======================================================
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ======================================================
// LOG HEADER
// ======================================================
console.log("-----------------------------------------------");
console.log("File Encryption Server Starting...");
console.log("Base directory:", BASE_DIR);
console.log("-----------------------------------------------");

// ======================================================
// MANAGER AUTH (VERIFY VIA AUTH SERVER)
// ======================================================
async function managerAuth(req, res, next) {
  let token = req.headers.authorization;

  console.log("\n[ManagerAuth] Incoming request");
  console.log("Authorization header:", token);

  if (!token) {
    console.log("Rejected: Missing manager token");
    return res.json({ success: false, error: "Missing manager token" });
  }

  try {
    const verifyRes = await fetch("http://localhost:7002/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });

    const data = await verifyRes.json();

    console.log("Verification server responded:");
    console.log(data);

    if (!data.success) {
      console.log("Token rejected by verification server.");
      return res.json({ success: false, error: "Invalid or expired token" });
    }

    const role = data.decoded.role.toLowerCase();

    console.log("Decoded role:", role);

    if (role !== "manager" && role !== "admin") {
      console.log("Rejected: Role does not have permission");
      return res.json({
        success: false,
        error: "Unauthorized. Managers only."
      });
    }

    console.log("ManagerAuth passed for user:", data.decoded.username);

    req.manager = data.decoded;
    next();

  } catch (err) {
    console.log("ManagerAuth error:", err.message);
    return res.json({ success: false, error: "Auth server unreachable" });
  }
}

// ======================================================
// 1) CREATE TEAM FOLDER
// ======================================================
app.post("/team/create", (req, res) => {
  const { teamName } = req.body;

  console.log("\n[Team Create] Request for team:", teamName);

  if (!teamName)
    return res.json({ success: false, error: "teamName required" });

  const teamPath = path.join(BASE_DIR, teamName);

  if (!fs.existsSync(teamPath)) {
    fs.mkdirSync(teamPath);
    console.log("Created new team folder:", teamPath);
  } else {
    console.log("Team folder already exists:", teamPath);
  }

  return res.json({
    success: true,
    message: "Team folder created: " + teamName
  });
});

// ======================================================
// 2) LIST FILES (.enc only)
// ======================================================
app.post("/team/list", (req, res) => {
  const { teamName } = req.body;

  console.log("\n[Team List] Requested:", teamName);

  if (!teamName)
    return res.json({ success: false, error: "teamName required" });

  const teamPath = path.join(BASE_DIR, teamName);

  if (!fs.existsSync(teamPath)) {
    console.log("Team folder missing. Creating:", teamPath);
    fs.mkdirSync(teamPath);

    return res.json({
      success: true,
      files: [],
      message: "Team folder was missing. Created automatically."
    });
  }

  const allFiles = fs.readdirSync(teamPath);
  const list = allFiles.filter(
    f => f.endsWith(".enc") && !f.endsWith(".key.enc")
  );

  console.log("Files found:", list);

  return res.json({
    success: true,
    files: list
  });
});

// ======================================================
// 3) ENCRYPT FILE (AES + RSA Hybrid)
// ======================================================
app.post("/file/encrypt", upload.single("file"), async (req, res) => {
  try {
    const { publicKey, teamName } = req.body;
    const file = req.file;

    console.log("\n[Encrypt] Team:", teamName);
    console.log("Received file:", file ? file.originalname : "None");

    if (!publicKey) return res.json({ success: false, error: "Missing publicKey" });
    if (!teamName) return res.json({ success: false, error: "Missing teamName" });
    if (!file) return res.json({ success: false, error: "Missing file" });

    const teamPath = path.join(BASE_DIR, teamName);
    if (!fs.existsSync(teamPath)) fs.mkdirSync(teamPath);

    // AES KEY + IV
    console.log("Generating AES-256 key and IV...");

    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    console.log("AES key length:", aesKey.length);
    console.log("IV length:", iv.length);

    const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
    const encryptedFile = Buffer.concat([
      cipher.update(file.buffer),
      cipher.final()
    ]);

    console.log("AES encryption completed.");

    // RSA encrypt AES key
    console.log("Encrypting AES key with RSA public key...");

    const encryptedAesKey = crypto.publicEncrypt(publicKey, aesKey);

    console.log("RSA encryption complete.");

    // Save files
    const encFileName = file.originalname + ".enc";
    const keyFileName = file.originalname + ".key.enc";
    const ivFileName = file.originalname + ".iv";

    fs.writeFileSync(path.join(teamPath, encFileName), encryptedFile);
    fs.writeFileSync(path.join(teamPath, keyFileName), encryptedAesKey);
    fs.writeFileSync(path.join(teamPath, ivFileName), iv);

    console.log("Files saved:", encFileName, keyFileName, ivFileName);

    return res.json({
      success: true,
      message: "File encrypted using hybrid RSA-AES",
      files: {
        encryptedFile: encFileName,
        encryptedKey: keyFileName,
        ivFile: ivFileName
      }
    });

  } catch (err) {
    console.log("Encrypt error:", err.message);
    return res.json({ success: false, error: err.message });
  }
});

// ======================================================
// 4) DECRYPT FILE (Hybrid AES-RSA)
// ======================================================
app.post("/file/decrypt", (req, res) => {
  try {
    const { privateKey, teamName, fileName } = req.body;

    console.log("\n[Decrypt] File:", fileName);
    console.log("Team:", teamName);

    if (!privateKey) return res.json({ success: false, error: "Missing privateKey" });
    if (!teamName) return res.json({ success: false, error: "Missing teamName" });
    if (!fileName) return res.json({ success: false, error: "Missing fileName" });

    const teamPath = path.join(BASE_DIR, teamName);

    const encFile = fs.readFileSync(path.join(teamPath, fileName));
    const encKey = fs.readFileSync(path.join(teamPath, fileName.replace(".enc", ".key.enc")));
    const iv = fs.readFileSync(path.join(teamPath, fileName.replace(".enc", ".iv")));

    console.log("Decrypting RSA encrypted AES key...");

    const aesKey = crypto.privateDecrypt(privateKey, encKey);

    console.log("AES key restored.");

    const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, iv);

    const decryptedBuffer = Buffer.concat([
      decipher.update(encFile),
      decipher.final()
    ]);

    console.log("Decryption complete. Sending file back.");

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName.replace(".enc", "")}"`);

    return res.send(decryptedBuffer);

  } catch (err) {
    console.log("Decrypt error:", err.message);
    return res.json({ success: false, error: err.message });
  }
});

// ======================================================
// 5) DELETE FILE (Manager Only)
// ======================================================
app.post("/file/delete", managerAuth, (req, res) => {
  try {
    const { teamName, fileName } = req.body;

    console.log("\n[Delete] Team:", teamName, "File:", fileName);

    if (!teamName || !fileName)
      return res.json({ success: false, error: "Missing teamName or fileName" });

    const teamPath = path.join(BASE_DIR, teamName);
    const filePath = path.join(teamPath, fileName);
    const keyPath = filePath.replace(".enc", ".key.enc");
    const ivPath = filePath.replace(".enc", ".iv");

    if (!fs.existsSync(filePath)) {
      console.log("File not found:", filePath);
      return res.json({ success: false, error: "File not found" });
    }

    fs.unlinkSync(filePath);
    if (fs.existsSync(keyPath)) fs.unlinkSync(keyPath);
    if (fs.existsSync(ivPath)) fs.unlinkSync(ivPath);

    console.log("Deleted all parts of file.");

    return res.json({
      success: true,
      message: fileName + " deleted successfully"
    });

  } catch (err) {
    console.log("Delete error:", err.message);
    return res.json({ success: false, error: err.message });
  }
});

// ======================================================
// START SERVER
// ======================================================
app.listen(7007, () => {
  console.log("-----------------------------------------------");
  console.log("File Encryption Server running on port 7007");
  console.log("-----------------------------------------------");
});
