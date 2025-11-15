const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
const { generateKeyPairSync } = require("crypto");

// -----------------------------
// CONFIG
// -----------------------------
const AUTH_SERVER = "http://localhost:4000"; // JWT Verifier server

// -----------------------------
// EXPRESS
// -----------------------------
const app = express();
app.use(cors());
app.use(express.json());
  
// -----------------------------
// MONGO
// -----------------------------
mongoose
  .connect(
    "mongodb+srv://DsUser:dsadmin14@inventorycluster.czhlw69.mongodb.net/DataSecurity",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Keys Manager API Connected to MongoDB"))
  .catch((err) => console.log("MongoDB Error:", err));

// -----------------------------
// SCHEMAS
// -----------------------------
const keySchema = new mongoose.Schema(
  {
    teamName: { type: String, required: true, unique: true },
    projectName: { type: String, required: true },
    keys: {
      publicKey: String,
      privateKey: String,
      generatedAt: String,
    },
  },
  { collection: "Keys" }
);

const Keys = mongoose.model("Keys", keySchema);

const teamSchema = new mongoose.Schema(
  {
    teamName: String,
    projectName: String,
    members: [
      {
        username: String,
        name: String,
      },
    ],
  },
  { collection: "Teams" }
);

const Teams = mongoose.model("Teams", teamSchema);

// -----------------------------
// RSA GENERATOR
// -----------------------------
function generateRSAKeys() {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "pkcs1", format: "pem" },
    privateKeyEncoding: { type: "pkcs1", format: "pem" },
  });

  return {
    publicKey,
    privateKey,
    generatedAt: new Date().toISOString(),
  };
}

// =======================================================
// 🔥🔥🔥 VERY IMPORTANT — YOU WERE MISSING THIS FUNCTION
// =======================================================
async function verifyTokenWithAuthServer(token) {
  try {
    const response = await axios.post(`${AUTH_SERVER}/verify`, { token });
    return response.data;
  } catch (err) {
    console.log("Auth Server Error:", err.message);
    return { success: false, error: "Auth server unreachable" };
  }
}

// -------------------------------------------------
// MANAGER AUTH
// -------------------------------------------------
async function verifyManager(req, res, next) {
  let token = req.headers.authorization;

  if (!token)
    return res.json({ success: false, error: "Missing Authorization token" });

  if (token.startsWith("Bearer ")) token = token.slice(7);

  const result = await verifyTokenWithAuthServer(token);

  if (!result.success) {
    return res.json({
      success: false,
      error: result.error,
      expiredAtIST: result.expiredAtIST,
    });
  }

  if (result.decoded.role !== "manager") {
    return res.json({
      success: false,
      error: "Unauthorized — Manager only",
    });
  }

  req.manager = result.decoded;
  next();
}

// -------------------------------------------------
// USER AUTH
// -------------------------------------------------
async function verifyUser(req, res, next) {
  let token = req.headers.authorization;
  if (!token)
    return res.json({ success: false, error: "Missing Authorization token" });

  if (token.startsWith("Bearer ")) token = token.slice(7);

  const result = await verifyTokenWithAuthServer(token);

  if (!result.success) {
    return res.json({
      success: false,
      error: result.error,
      expiredAtIST: result.expiredAtIST,
    });
  }

  if (result.decoded.role !== "user") {
    return res.json({
      success: false,
      error: "Unauthorized — User only",
    });
  }

  req.user = result.decoded;
  next();
}

// =======================================================
// 1) GENERATE KEYS FOR NEW TEAM
// =======================================================
app.post("/new/generate", verifyManager, async (req, res) => {
  try {
    const { teamName, projectName } = req.body;

    if (!teamName || !projectName)
      return res.json({ success: false, error: "Missing fields" });

    const exists = await Keys.findOne({ teamName });
    if (exists)
      return res.json({ success: false, error: "Keys already exist" });

    const keys = generateRSAKeys();
    await new Keys({ teamName, projectName, keys }).save();

    return res.json({ success: true, keys });
  } catch (err) {
    return res.json({ success: false, error: err.message });
  }
});

// =======================================================
// 2) REGENERATE KEYS
// =======================================================
app.post("/existing/generate", verifyManager, async (req, res) => {
  try {
    const { teamName } = req.body;

    const keys = generateRSAKeys();

    const updated = await Keys.findOneAndUpdate(
      { teamName },
      { $set: { keys } },
      { new: true }
    );

    if (!updated)
      return res.json({ success: false, error: "Team not found" });

    return res.json({ success: true, keys });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// =======================================================
// 3) FETCH FULL KEYS (MANAGER ONLY)
// =======================================================
app.post("/existing/fetch", verifyManager, async (req, res) => {
  try {
    const { teamName } = req.body;

    const data = await Keys.findOne({ teamName });
    if (!data) return res.json({ success: false, error: "Team not found" });

    return res.json({ success: true, keys: data.keys });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// =======================================================
// 4) FETCH PUBLIC KEY (USER ONLY + MUST BE MEMBER)
// =======================================================
app.post("/existing/public/fetch", verifyUser, async (req, res) => {
  try {
    const { teamName } = req.body;
    const username = req.user.username;

    const team = await Teams.findOne({ teamName });
    if (!team) return res.json({ success: false, error: "Team not found" });

    console.log("\n🔍 PUBLIC KEY ACCESS ATTEMPT");
    console.log("User:", username);
    console.log("Team requested:", teamName);
    console.log("Team members:", team.members.map(m => m.username));

    const isMember = team.members.some((m) => m.username === username);
    if (!isMember)
      return res.json({ success: false, error: "Not a team member" });

    const keyData = await Keys.findOne({ teamName });
    if (!keyData)
      return res.json({ success: false, error: "Keys not found" });

    res.json({ success: true, publicKey: keyData.keys.publicKey });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});


// -----------------------------
// START SERVER
// -----------------------------
const PORT = 7200;
app.listen(PORT, () =>
  console.log(`Keys Manager API running on port ${PORT}`)
);
