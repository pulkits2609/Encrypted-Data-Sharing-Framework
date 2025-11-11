// verifierServer.js
const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
  console.error("❌ JWT_SECRET not found in .env");
  process.exit(1);
}

// 🔸 Helper: Convert any UTC date to IST
function toIST(utcDateString) {
  if (!utcDateString) return null;
  return new Date(utcDateString).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  });
}

// POST /verify → verify JWT token
app.post("/verify", (req, res) => {
  const token = req.body.token;

  if (!token) {
    return res.status(400).json({ success: false, error: "Token is required" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY, {
      algorithms: ["HS256"],
      issuer: "auth-server",
      audience: "my-api",
    });

    // Calculate IST expiry time from token payload
    const expiryUTC = new Date(decoded.exp * 1000).toISOString();
    const expiryIST = toIST(expiryUTC);

    res.json({
      success: true,
      message: "✅ Token is valid",
      decoded,
      expiresAtIST: expiryIST,
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // Convert expiredAt UTC to IST
      const expiredAtIST = toIST(err.expiredAt);

      return res.status(401).json({
        success: false,
        error: "Token has expired",
        expiredAtUTC: err.expiredAt,
        expiredAtIST,
      });
    } else {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
        message: err.message,
      });
    }
  }
});

app.listen(3000, () => {
  console.log("🔍 Verifier Server running on port 3000");
  console.log("POST /verify to validate a token");
});
