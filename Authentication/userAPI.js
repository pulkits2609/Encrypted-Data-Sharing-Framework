const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const KEYS_SERVER = "http://localhost:7200";  // keysManager API

// -------------------------
// MongoDB
// -------------------------
mongoose
  .connect("mongodb+srv://DsUser:dsadmin14@inventorycluster.czhlw69.mongodb.net/DataSecurity")
  .then(() => console.log("User API Connected to MongoDB"))
  .catch((err) => console.log("MongoDB Error:", err));

// Teams Schema
const teamSchema = new mongoose.Schema(
  {
    teamName: String,
    projectName: String,
    members: [{ username: String, name: String }],
  },
  { collection: "Teams" }
);
const Teams = mongoose.model("Teams", teamSchema);

// -------------------------
// 1️⃣ Get all teams for a user
// -------------------------
app.post("/teams/my", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username)
      return res.json({ success: false, error: "Username required" });

    const teams = await Teams.find(
      { "members.username": username },
      { _id: 0 }
    );

    return res.json({ success: true, teams });

  } catch (err) {
    return res.json({ success: false, error: err.message });
  }
});

// -------------------------
// 2️⃣ Fetch public key (redirect to keysManager)
// -------------------------
app.post("/teams/publickey", async (req, res) => {
  try {
    const { JWT, teamName } = req.body;

    if (!JWT) {
      return res.json({ success: false, error: "Missing JWT" });
    }

    const response = await axios.post(
      `${KEYS_SERVER}/existing/public/fetch`,
      { teamName },
      {
        headers: {
          Authorization: JWT
        }
      }
    );

    return res.json(response.data);

  } catch (err) {
    console.log("Public key fetch error:", err.message);
    return res.json({ success: false, error: "Unable to fetch public key" });
  }
});


// -------------------------
// Start server
// -------------------------
const PORT = 7500;
app.listen(PORT, () => {
  console.log(`User API running on port ${PORT}`);
});
