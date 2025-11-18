// keysManager.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
const { generateKeyPairSync } = require("crypto");

// --------------------------------------------------
// CONFIG
// --------------------------------------------------
const AUTH_SERVER = "http://localhost:7002";

// --------------------------------------------------
// EXPRESS
// --------------------------------------------------
const app = express();

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

console.log("--------------------------------------------------");
console.log("Keys Manager API Starting...");
console.log("--------------------------------------------------");

// --------------------------------------------------
// MONGODB
// --------------------------------------------------
const MONGO_URL =
  "mongodb+srv://DsUser:dsadmin14@inventorycluster.czhlw69.mongodb.net/DataSecurity";

mongoose
  .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected: DataSecurity"))
  .catch((err) => console.log("MongoDB connection error:", err.message));

// --------------------------------------------------
// SCHEMAS
// --------------------------------------------------
const keySchema = new mongoose.Schema(
  {
    teamName: { type: String, required: true, unique: true },
    projectName: { type: String, required: true },
    keys: {
      publicKey: String,
      privateKey: String,
      generatedAt: String
    }
  },
  { collection: "Keys" }
);

const Keys = mongoose.model("Keys", keySchema);

const teamSchema = new mongoose.Schema(
  {
    teamName: String,
    projectName: String,
    members: [{ username: String, name: String }]
  },
  { collection: "Teams" }
);

const Teams = mongoose.model("Teams", teamSchema);

// --------------------------------------------------
// RSA KEY GENERATION
// --------------------------------------------------
function generateRSAKeys() {
  console.log("Generating RSA keys (2048-bit)...");

  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "pkcs1", format: "pem" },
    privateKeyEncoding: { type: "pkcs1", format: "pem" }
  });

  console.log("RSA key generation complete.");

  return {
    publicKey,
    privateKey,
    generatedAt: new Date().toISOString()
  };
}

// --------------------------------------------------
// VERIFY TOKEN VIA AUTH SERVER
// --------------------------------------------------
async function verifyTokenWithAuthServer(token) {
  try {
    console.log("Verifying token with Auth Server...");
    const response = await axios.post(`${AUTH_SERVER}/verify`, { token });
    console.log("Token verified");
    return response.data;
  } catch (err) {
    console.log("Auth server verify error:", err.message);
    return { success: false, error: "Auth server unreachable" };
  }
}

// --------------------------------------------------
// MANAGER AUTH MIDDLEWARE
// --------------------------------------------------
async function verifyManager(req, res, next) {
  let token = req.headers.authorization;

  console.log("Incoming Manager request");

  if (!token) {
    console.log("Rejected: Missing Authorization header");
    return res.json({ success: false, error: "Missing Authorization token" });
  }

  if (token.startsWith("Bearer ")) token = token.slice(7);

  const result = await verifyTokenWithAuthServer(token);

  if (!result.success) {
    console.log("Token invalid or expired");
    return res.json({
      success: false,
      error: result.error,
      expiredAtIST: result.expiredAtIST
    });
  }

  if (result.decoded.role !== "manager") {
    console.log("Rejected: Not manager");
    return res.json({ success: false, error: "Unauthorized - Manager only" });
  }

  console.log("Manager verified:", result.decoded.username);
  req.manager = result.decoded;
  next();
}

// --------------------------------------------------
// USER AUTH
// --------------------------------------------------
async function verifyUser(req, res, next) {
  let token = req.headers.authorization;

  console.log("Incoming User request");

  if (!token) {
    console.log("Rejected: Missing Authorization token");
    return res.json({ success: false, error: "Missing Authorization token" });
  }

  if (token.startsWith("Bearer ")) token = token.slice(7);

  const result = await verifyTokenWithAuthServer(token);

  if (!result.success) {
    console.log("Token invalid or expired");
    return res.json({
      success: false,
      error: result.error,
      expiredAtIST: result.expiredAtIST
    });
  }

  if (result.decoded.role !== "user") {
    console.log("Rejected: Not user role");
    return res.json({ success: false, error: "Unauthorized - User only" });
  }

  console.log("User verified:", result.decoded.username);
  req.user = result.decoded;
  next();
}

// ==========================================================
// 1) GENERATE KEYS FOR NEW TEAM
// ==========================================================
app.post("/new/generate", verifyManager, async (req, res) => {
  console.log("Request: POST /new/generate");

  try {
    const { teamName, projectName } = req.body;

    if (!teamName || !projectName) {
      console.log("Rejected: Missing fields");
      return res.json({ success: false, error: "Missing fields" });
    }

    const exists = await Keys.findOne({ teamName });

    if (exists) {
      console.log("Keys already exist for:", teamName);
      return res.json({ success: false, error: "Keys already exist" });
    }

    const keys = generateRSAKeys();

    await new Keys({ teamName, projectName, keys }).save();

    console.log("Keys stored for:", teamName);
    return res.json({ success: true, keys });

  } catch (err) {
    console.log("Error in /new/generate:", err.message);
    return res.json({ success: false, error: err.message });
  }
});

// ==========================================================
// 2) REGENERATE KEYS
// ==========================================================
app.post("/existing/generate", verifyManager, async (req, res) => {
  console.log("Request: POST /existing/generate");

  try {
    const { teamName } = req.body;

    const keys = generateRSAKeys();

    const updated = await Keys.findOneAndUpdate(
      { teamName },
      { $set: { keys } },
      { new: true }
    );

    if (!updated) {
      console.log("Team not found");
      return res.json({ success: false, error: "Team not found" });
    }

    console.log("Keys regenerated for:", teamName);
    return res.json({ success: true, keys });

  } catch (err) {
    console.log("Error regenerating keys:", err.message);
    return res.json({ success: false, error: err.message });
  }
});

// ==========================================================
// 3) FETCH FULL KEYS FOR MANAGER
// ==========================================================
app.post("/existing/fetch", verifyManager, async (req, res) => {
  console.log("Request: POST /existing/fetch");

  try {
    const { teamName } = req.body;

    const data = await Keys.findOne({ teamName });

    if (!data) {
      console.log("Keys not found for:", teamName);
      return res.json({ success: false, error: "Team not found" });
    }

    console.log("Keys delivered for:", teamName);
    return res.json({ success: true, keys: data.keys });

  } catch (err) {
    console.log("Error fetching keys:", err.message);
    return res.json({ success: false, error: err.message });
  }
});

// ==========================================================
// 4) FETCH PUBLIC KEY (USER + must be team member)
// ==========================================================
app.post("/existing/public/fetch", verifyUser, async (req, res) => {
  console.log("Request: POST /existing/public/fetch");

  try {
    const { teamName } = req.body;
    const username = req.user.username;

    console.log("User:", username, "requesting key for:", teamName);

    const team = await Teams.findOne({ teamName });

    if (!team) {
      console.log("Team not found");
      return res.json({ success: false, error: "Team not found" });
    }

    const members = team.members.map(m => m.username);

    if (!members.includes(username)) {
      console.log("User not in team");
      return res.json({ success: false, error: "Not a team member" });
    }

    const keyData = await Keys.findOne({ teamName });

    if (!keyData) {
      console.log("Public key not found");
      return res.json({ success: false, error: "Keys not found" });
    }

    console.log("Public key delivered to:", username);
    return res.json({ success: true, publicKey: keyData.keys.publicKey });

  } catch (err) {
    console.log("Error:", err.message);
    return res.json({ success: false, error: err.message });
  }
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------
app.listen(7006, () => {
  console.log("Keys Manager API running on port 7006");
  console.log("--------------------------------------------------");
});
