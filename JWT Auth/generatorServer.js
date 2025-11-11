// generatorServer.js
const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET;
const TOKEN_EXPIRY_SECONDS = process.env.TOKEN_EXPIRY_SECONDS || 30; // default 30s

if (!SECRET_KEY) {
  console.error("❌ JWT_SECRET not found in .env");
  process.exit(1);
}

// 🔸 Helper: Get current time in IST
function getISTTime() {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  });
}

/**
 * POST /generate
 * Body: { "name": "Pulkit Sharma", "department": "IT", "role": "Admin" }
 */
app.post("/generate", (req, res) => {
  const { name, department, role } = req.body;

  if (!name || !department || !role) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: name, department, and role are required.",
    });
  }

  // 🧩 Payload with IST timestamp
  const generatedAt = getISTTime();
  const payload = {
    name,
    department,
    role,
    generatedAt, // IST time
  };

  const options = {
    algorithm: "HS256",
    expiresIn: `${TOKEN_EXPIRY_SECONDS}s`,
    issuer: "auth-server",
    audience: "my-api",
  };

  try {
    const token = jwt.sign(payload, SECRET_KEY, options);

    // Calculate expiry time (IST)
    const expiryTimeIST = new Date(Date.now() + TOKEN_EXPIRY_SECONDS * 1000).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: false,
    });

    console.log(`✅ Token generated for ${name} (${role})`);
    console.log(`🕒 Generated at (IST): ${generatedAt}`);
    console.log(`⏰ Expires at (IST): ${expiryTimeIST}`);
    console.log("Token:", token);

    res.json({
      success: true,
      message: "Token generated successfully.",
      token,
      expiresIn: `${TOKEN_EXPIRY_SECONDS}s`,
      generatedAtIST: generatedAt,
      expiresAtIST: expiryTimeIST,
      issuedTo: { name, department, role },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(4000, () => {
  console.log("🚀 Auth Generator Server running on port 4000");
  console.log(`POST /generate to create a new token (valid for ${TOKEN_EXPIRY_SECONDS}s)`);
});
