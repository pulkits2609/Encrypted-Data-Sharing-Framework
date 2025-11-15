// generatorServer.js
const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET;
const TOKEN_EXPIRY_SECONDS = process.env.TOKEN_EXPIRY_SECONDS || 600;

if (!SECRET_KEY) {
  console.error("❌ JWT_SECRET not found in .env");
  process.exit(1);
}

// 🔸 Helper: Get IST time
function getISTTime() {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  });
}

/**
 * POST /generate
 * Body: { "username": "User1", "role": "user", "department": "IT" }
 */
app.post("/generate", (req, res) => {
  const { username, role, department } = req.body;

  // ❌ Validate
  if (!username || !role || !department) {
    return res.status(400).json({
      success: false,
      message: "Missing fields: username, role, and department are required.",
    });
  }

  const generatedAt = getISTTime();

  // ✔ JWT Payload (NOW correct)
  const payload = {
    username,
    role,
    department,
    generatedAt
  };

  const options = {
    algorithm: "HS256",
    expiresIn: `${TOKEN_EXPIRY_SECONDS}s`,
    issuer: "auth-server",
    audience: "my-api"
  };

  try {
    const token = jwt.sign(payload, SECRET_KEY, options);

    const expiresAtIST = new Date(Date.now() + TOKEN_EXPIRY_SECONDS * 1000).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: false
    });

    console.log(`\n✅ Token generated for ${username} (${role})`);
    console.log(`🕒 Generated at (IST): ${generatedAt}`);
    console.log(`⏰ Expires at (IST): ${expiresAtIST}`);
    console.log("Token:", token);

    res.json({
      success: true,
      message: "Token generated successfully.",
      token,
      expiresIn: `${TOKEN_EXPIRY_SECONDS}s`,
      generatedAtIST: generatedAt,
      expiresAtIST,
      issuedTo: { username, role, department }
    });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.listen(4001, () => {
  console.log("🚀 Auth Generator Server running on port 4001");
});
