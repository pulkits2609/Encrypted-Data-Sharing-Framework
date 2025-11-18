// generatorServer.js
const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

const ENABLE_LOGS = true; // Turn OFF in production

// ------------------------------
// CORS
// ------------------------------
app.use(
  cors({
    origin: [
      "http://localhost:7000",
      "https://dsproject.pulkitworks.info"
    ],
    methods: ["POST"],
    credentials: true
  })
);

app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
  console.error("ERROR: JWT_SECRET not found in .env");
  process.exit(1);
}

// Convert UTC → IST
function toIST(utcString) {
  return new Date(utcString).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  });
}

// ------------------------------
// POST /generate
// ------------------------------
app.post("/generate", (req, res) => {
  const { username, department, role } = req.body;

  if (!username || !department || !role) {
    return res.json({ success: false, message: "Missing required fields" });
  }

  try {
    const token = jwt.sign(
      { username, department, role },
      SECRET_KEY,
      {
        algorithm: "HS256",
        expiresIn: "1h",
        issuer: "auth-server",
        audience: "my-api"
      }
    );

    const decoded = jwt.decode(token);

    const expiryUTC = new Date(decoded.exp * 1000).toISOString();
    const expiryIST = toIST(expiryUTC);

    if (ENABLE_LOGS) {
      console.log("\n=========================================");
      console.log(" NEW JWT GENERATED ");
      console.log("=========================================");
      console.log("Username:", username);
      console.log("Role:", role);
      console.log("Department:", department);
      console.log("Generated At (IST):", toIST(new Date().toISOString()));
      console.log("Expires At (UTC):", expiryUTC);
      console.log("Expires At (IST):", expiryIST);
      console.log("Token:", token);
      console.log("=========================================\n");
    }

    return res.json({
      success: true,
      token,
      expiresAtIST: expiryIST
    });

  } catch (err) {
    if (ENABLE_LOGS) {
      console.error("Token generation failed:", err.message);
    }

    return res.json({ success: false, message: "Token generation failed" });
  }
});

app.listen(7001, () => {
  console.log("JWT Generator running on port 7001");
});
