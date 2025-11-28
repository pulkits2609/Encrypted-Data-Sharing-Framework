// verifierServer.js
const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
/* Minimal required CORS */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://dsproject.pulkitworks.info");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

const ENABLE_LOGS = true;

app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
  console.error("ERROR: JWT_SECRET not found in .env");
  process.exit(1);
}

function toIST(utcDateString) {
  return new Date(utcDateString).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  });
}

//test get
app.get("/", (req, res) => {
  res.json({ success: true, message: "Verifier Server Active" });
});


// ------------------------------
// POST /verify
// ------------------------------
app.post("/verify", (req, res) => {
  const token = req.body.token;

  if (ENABLE_LOGS) {
    console.log("\n-------------------------------------------");
    console.log(" VERIFY TOKEN REQUEST RECEIVED ");
    console.log("-------------------------------------------");
    console.log("Token:", token);
  }

  if (!token) {
    console.error("Error: Token missing from request body");
    return res.status(400).json({ success: false, error: "Token is required" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY, {
      algorithms: ["HS256"],
      issuer: "auth-server",
      audience: "my-api",
    });

    const expiryUTC = new Date(decoded.exp * 1000).toISOString();
    const expiryIST = toIST(expiryUTC);

    if (ENABLE_LOGS) {
      console.log("STATUS: Token is valid");
      console.log("Username:", decoded.username);
      console.log("Role:", decoded.role);
      console.log("Department:", decoded.department);
      console.log("Issued At (IST):", toIST(decoded.iat * 1000));
      console.log("Expires At (UTC):", expiryUTC);
      console.log("Expires At (IST):", expiryIST);
      console.log("-------------------------------------------\n");
    }

    return res.json({
      success: true,
      message: "Token is valid",
      decoded,
      expiresAtIST: expiryIST,
    });

  } catch (err) {
    if (ENABLE_LOGS) {
      console.log("STATUS: Token verification failed");
      console.log("Error Type:", err.name);
      console.log("Message:", err.message);
      if (err.expiredAt) {
        console.log("Expired At (UTC):", err.expiredAt);
        console.log("Expired At (IST):", toIST(err.expiredAt));
      }
      console.log("-------------------------------------------\n");
    }

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token has expired",
        expiredAtUTC: err.expiredAt,
        expiredAtIST: toIST(err.expiredAt),
      });
    }

    return res.status(401).json({
      success: false,
      error: "Invalid token",
      message: err.message,
    });
  }
});

app.listen(7002, () => {
  console.log("JWT Verifier running on port 7002");
});
