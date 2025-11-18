// userServer.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();

// ================================
// CORS FOR FRONTEND ACCESS
// ================================
app.use(
  cors({
    origin: [
      "http://localhost:7000",
      "https://dsproject.pulkitworks.info"
    ],
    methods: ["GET", "POST"],
    credentials: true
  })
);

app.use(express.json());

// Keys Manager
const KEYS_SERVER = "http://localhost:7006";

// MongoDB Connection
mongoose
  .connect("mongodb+srv://DsUser:dsadmin14@inventorycluster.czhlw69.mongodb.net/DataSecurity")
  .then(() => console.log("User API connected to MongoDB"))
  .catch(err => console.log("MongoDB connection error:", err));

// Team Schema
const teamSchema = new mongoose.Schema(
  {
    teamName: String,
    projectName: String,
    members: [{ username: String, name: String }]
  },
  { collection: "Teams" }
);

const Teams = mongoose.model("Teams", teamSchema);

// ---------------------------------------------------
// 1. Get teams for a user
// ---------------------------------------------------
app.post("/teams/my", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      console.log("Missing username in /teams/my");
      return res.json({ success: false, error: "Username required" });
    }

    const teams = await Teams.find(
      { "members.username": username },
      { _id: 0 }
    );

    console.log("Teams fetched for user:", username);

    return res.json({ success: true, teams });
  } catch (err) {
    console.error("Error in /teams/my:", err.message);
    return res.json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------
// 2. Get public key → forwarded to Keys Server
// ---------------------------------------------------
app.post("/teams/publickey", async (req, res) => {
  try {
    const { JWT, teamName } = req.body;

    if (!JWT) {
      console.log("Missing JWT for public key request");
      return res.json({ success: false, error: "Missing JWT" });
    }

    const response = await axios.post(
      `${KEYS_SERVER}/existing/public/fetch`,
      { teamName },
      { headers: { Authorization: JWT } }
    );

    console.log("Public key fetched for:", teamName);
    return res.json(response.data);
  } catch (err) {
    console.log("Public key fetch error:", err.message);
    return res.json({ success: false, error: "Unable to fetch public key" });
  }
});

// ---------------------------------------------------
// Start Server
// ---------------------------------------------------
app.listen(7005, () => {
  console.log("User API running on port 7005");
});
