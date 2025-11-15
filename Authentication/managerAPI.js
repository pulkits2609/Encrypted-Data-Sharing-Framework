// managerAPI.js

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// -------------------------
// Express Setup
// -------------------------
const app = express();
app.use(cors());
app.use(express.json());

// -------------------------
// MongoDB Connection
// -------------------------
mongoose
  .connect("mongodb+srv://DsUser:dsadmin14@inventorycluster.czhlw69.mongodb.net/DataSecurity?retryWrites=true&w=majority&appName=InventoryCluster", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Manager API Connected to MongoDB"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// -------------------------
// Teams Collection Schema
// -------------------------
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
  { collection: "Teams" }   // <-- IMPORTANT FIX
);

const Team = mongoose.model("Teams", teamSchema);

// -------------------------
// GET API: Fetch teams summary
// -------------------------
// GET API: Fetch teams summary (teamName + projectName + memberCount)
app.get("/teams", async (req, res) => {
  try {
    // Fetch only what we need
    const teams = await Team.find({}, { teamName: 1, projectName: 1, members: 1 });

    // Format output
    const formatted = teams.map((t) => ({
      teamName: t.teamName,
      projectName: t.projectName,
      memberCount: t.members.length,
    }));

    return res.json({
      success: true,
      teams: formatted,
    });
  } catch (err) {
    console.log("Error fetching teams:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch teams",
    });
  }
});

// -------------------------
// POST API: Manage a team (fetch full details of selected team)
// -------------------------
app.post("/teams/manage", async (req, res) => {
  try {
    const { teamName } = req.body;

    if (!teamName) {
      return res.status(400).json({
        success: false,
        error: "teamName is required in the request body"
      });
    }

    // Find a team by name
    const team = await Team.findOne(
      { teamName },
      { _id: 0 }  // remove internal MongoDB id
    );

    if (!team) {
      return res.status(404).json({
        success: false,
        error: "Team not found"
      });
    }

    return res.json({
      success: true,
      team: team
    });

  } catch (err) {
    console.log("Error in /teams/manage:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch team details"
    });
  }
});
// -------------------------
// GET API: Fetch all non-manager users
// -------------------------
const userSchema = new mongoose.Schema(
  {
    username: String,
    name: String,
    password: String,
    role: String, // "manager" or "user"
  },
  { collection: "users" }
);

const User = mongoose.model("users", userSchema);

app.get("/users/all", async (req, res) => {
  try {
    // Fetch users whose role is NOT manager
    const users = await User.find(
      { role: { $ne: "manager" } },
      { password: 0 } // Do not expose passwords
    );

    return res.json({
      success: true,
      users: users,
    });
  } catch (err) {
    console.log("Error fetching users:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
});

// -------------------------
// POST API: Completely update team members array
// -------------------------
app.post("/teams/update", async (req, res) => {
  try {
    const { teamName, members } = req.body;

    if (!teamName || !members) {
      return res.status(400).json({
        success: false,
        error: "teamName and members array are required",
      });
    }

    // Replace entire members array (no append)
    const updatedTeam = await Team.findOneAndUpdate(
      { teamName },
      { $set: { members: members } },
      { new: true }
    );

    if (!updatedTeam) {
      return res.status(404).json({
        success: false,
        error: "Team not found",
      });
    }

    return res.json({
      success: true,
      message: "Team members updated successfully",
      team: updatedTeam,
    });

  } catch (err) {
    console.log("Error updating team:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to update team members",
    });
  }
});

// CREATE NEW USER
app.post("/user/new", async (req, res) => {
  try {
    const { username, password, name, role } = req.body;

    if (!username || !password || !name || !role) {
      return res.json({ success: false, error: "All fields are required" });
    }

    // Check if username exists
    const existingUser = await User.findOne({ username });   // FIXED (User)

    if (existingUser) {
      return res.json({
        success: false,
        error: "Username already exists. Please choose another.",
      });
    }

    // Create user
    const newUser = new User({
      username,
      password,
      name,
      role: role.toLowerCase(),
    });

    await newUser.save();

    return res.json({ success: true, message: "User created successfully!" });

  } catch (err) {
    console.error("Error creating user:", err);
    return res.json({ success: false, error: err.message });
  }
});

// -------------------------
// POST: Create New Team
// -------------------------
// CREATE NEW TEAM + AUTO GENERATE KEYS
app.post("/teams/new", async (req, res) => {
  try {
    const { teamName, projectName, members, managerToken } = req.body;

    if (!teamName || !projectName || !members) {
      return res.json({ success: false, error: "Missing fields" });
    }

    // ❌ Check if team already exists
    const existing = await Team.findOne({ teamName });
    if (existing) {
      return res.json({
        success: false,
        error: "Team already exists!"
      });
    }

    // ✅ Create the team first
    await new Team({
      teamName,
      projectName,
      members,
    }).save();

    // ============================
    // 🔥 AUTO GENERATE KEYS NOW
    // ============================
    const keyResponse = await fetch("http://localhost:7200/new/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": managerToken, // IMPORTANT
      },
      body: JSON.stringify({ teamName, projectName }),
    });

    const keyData = await keyResponse.json();

    if (!keyData.success) {
      return res.json({
        success: false,
        error: "Team created, BUT key generation failed: " + keyData.error,
      });
    }

    // SUCCESS
    return res.json({
      success: true,
      message: "Team created + Keys generated!",
      keys: keyData.keys,
    });

  } catch (err) {
    return res.json({ success: false, error: err.message });
  }
});


// -------------------------
// Start Server
// -------------------------
const PORT = 7000;
app.listen(PORT, () => {
  console.log(`Manager API running on port ${PORT}`);
});
