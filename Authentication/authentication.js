// loginServer.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// =======================================
// CORS: Allow React (local + production)
// =======================================
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

// =======================================
// MongoDB Connection
// =======================================
const mongoURL =
  "mongodb+srv://DsUser:dsadmin14@inventorycluster.czhlw69.mongodb.net/DataSecurity?retryWrites=true&w=majority";

(async () => {
  try {
    await mongoose.connect(mongoURL);
    console.log("Connected to MongoDB: DataSecurity.users");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
})();

// =======================================
// User Schema
// =======================================
const userSchema = new mongoose.Schema(
  {
    username: String,
    name: String,
    password: String,
    role: String
  },
  { collection: "users" }
);

const User = mongoose.model("User", userSchema);

// =======================================
// LOGIN ROUTE
// =======================================
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      console.log("Login failed: Missing username or password");
      return res.status(400).json({
        success: false,
        message: "Username and password are required."
      });
    }

    const user = await User.findOne({
      username: username.trim(),
      password: password.trim()
    });

    if (!user) {
      console.log("Login failed | username=" + username + " | reason=Invalid credentials");
      return res.status(401).json({
        success: false,
        message: "Invalid username or password."
      });
    }

    console.log("User authenticated:");
    console.log("  Username:", user.username);
    console.log("  Role:", user.role);
    console.log("  Name:", user.name);
    console.log("----------------------------------------");

    return res.status(200).json({
      success: true,
      message: "Login successful",
      name: user.name,
      role: user.role,
      username: user.username
    });

  } catch (error) {
    console.error("Login server error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// =======================================
// START SERVER
// =======================================
app.listen(7003, () => {
  console.log("Login Server running on port 7003");
});
