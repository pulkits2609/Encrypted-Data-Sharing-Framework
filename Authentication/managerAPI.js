// managerAPI.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// ----------------------------------------------------
// Express Setup
// ----------------------------------------------------
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

app.use(express.json());

console.log("--------------------------------------------------");
console.log("Manager API Server starting...");
console.log("--------------------------------------------------");

// ----------------------------------------------------
// MongoDB
// ----------------------------------------------------
const MONGO_URL =
  "mongodb+srv://DsUser:dsadmin14@inventorycluster.czhlw69.mongodb.net/DataSecurity?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB connected: DataSecurity"))
  .catch(err => console.log("MongoDB connection error:", err));

// ----------------------------------------------------
// Team Schema
// ----------------------------------------------------
const teamSchema = new mongoose.Schema(
  {
    teamName: String,
    projectName: String,
    members: [{ username: String, name: String }]
  },
  { collection: "Teams" }
);

const Team = mongoose.model("Teams", teamSchema);

// ----------------------------------------------------
// User Schema
// ----------------------------------------------------
const userSchema = new mongoose.Schema(
  {
    username: String,
    name: String,
    password: String,
    role: String
  },
  { collection: "users" }
);

const User = mongoose.model("users", userSchema);

// ----------------------------------------------------
// GET /teams
// ----------------------------------------------------
app.get("/teams", async (req, res) => {
  console.log("Request: GET /teams");

  try {
    const teams = await Team.find({}, { teamName: 1, projectName: 1, members: 1 });

    const formatted = teams.map(t => ({
      teamName: t.teamName,
      projectName: t.projectName,
      memberCount: t.members.length
    }));

    console.log("Teams fetched:", formatted.length);

    return res.json({ success: true, teams: formatted });
  } catch (err) {
    console.log("Error fetching teams:", err.message);
    return res.status(500).json({ success: false, error: "Failed to fetch teams" });
  }
});

// ----------------------------------------------------
// POST /teams/manage
// ----------------------------------------------------
app.post("/teams/manage", async (req, res) => {
  console.log("Request: POST /teams/manage");

  try {
    const { teamName } = req.body;

    if (!teamName) {
      console.log("Missing teamName");
      return res.status(400).json({ success: false, error: "teamName is required" });
    }

    const team = await Team.findOne({ teamName }, { _id: 0 });

    if (!team) {
      console.log("Team not found");
      return res.status(404).json({ success: false, error: "Team not found" });
    }

    console.log("Team fetched:", teamName);
    return res.json({ success: true, team });
  } catch (err) {
    console.log("Error fetching team:", err.message);
    return res.status(500).json({ success: false, error: "Failed to fetch team" });
  }
});

// ----------------------------------------------------
// GET /users/all
// ----------------------------------------------------
app.get("/users/all", async (req, res) => {
  console.log("Request: GET /users/all");

  try {
    const users = await User.find({ role: { $ne: "manager" } }, { password: 0 });

    console.log("Users fetched:", users.length);

    return res.json({ success: true, users });
  } catch (err) {
    console.log("Error fetching users:", err.message);
    return res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
});

// ----------------------------------------------------
// POST /teams/update
// ----------------------------------------------------
app.post("/teams/update", async (req, res) => {
  console.log("Request: POST /teams/update");

  try {
    const { teamName, members } = req.body;

    if (!teamName || !members) {
      console.log("Missing fields");
      return res.json({ success: false, error: "teamName and members are required" });
    }

    const updated = await Team.findOneAndUpdate(
      { teamName },
      { $set: { members } },
      { new: true }
    );

    if (!updated) {
      console.log("Team not found");
      return res.json({ success: false, error: "Team not found" });
    }

    console.log("Team updated:", teamName);
    return res.json({ success: true, message: "Team members updated", team: updated });
  } catch (err) {
    console.log("Error updating team:", err.message);
    return res.json({ success: false, error: "Failed to update team members" });
  }
});

// ----------------------------------------------------
// POST /user/new
// ----------------------------------------------------
app.post("/user/new", async (req, res) => {
  console.log("Request: POST /user/new");

  try {
    const { username, password, name, role } = req.body;

    if (!username || !password || !name || !role) {
      console.log("Missing fields");
      return res.json({ success: false, error: "All fields are required" });
    }

    const exists = await User.findOne({ username });

    if (exists) {
      console.log("Username exists:", username);
      return res.json({ success: false, error: "Username already exists" });
    }

    await new User({ username, password, name, role }).save();

    console.log("User created:", username);
    return res.json({ success: true, message: "User created successfully" });
  } catch (err) {
    console.log("Error creating user:", err.message);
    return res.json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// POST /teams/new
// ----------------------------------------------------
app.post("/teams/new", async (req, res) => {
  console.log("Request: POST /teams/new");

  try {
    const { teamName, projectName, members, managerToken } = req.body;

    if (!teamName || !projectName || !members) {
      console.log("Missing fields");
      return res.json({ success: false, error: "Missing fields" });
    }

    const existing = await Team.findOne({ teamName });

    if (existing) {
      console.log("Team exists:", teamName);
      return res.json({ success: false, error: "Team already exists" });
    }

    await new Team({ teamName, projectName, members }).save();

    console.log("Team created:", teamName);
    console.log("Requesting key generation from Keys Server...");

    const response = await fetch("http://localhost:7006/new/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: managerToken
      },
      body: JSON.stringify({ teamName, projectName })
    });

    const keyData = await response.json();

    if (!keyData.success) {
      console.log("Key generation failed");
      return res.json({
        success: false,
        error: "Team created but key generation failed"
      });
    }

    console.log("Keys generated for:", teamName);

    return res.json({
      success: true,
      message: "Team created and keys generated",
      keys: keyData.keys
    });
  } catch (err) {
    console.log("Error creating team:", err.message);
    return res.json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// Start Server
// ----------------------------------------------------
app.listen(7004, () => {
  console.log("Manager API running on port 7004");
  console.log("--------------------------------------------------");
});
