const express = require('express');
const mongoose = require('mongoose');

const app = express();

//minimum cors
/* Minimal required CORS */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://dsproject.pulkitworks.info");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* ONLY JSON middleware */
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
// LOGIN ROUTE (NO CORS ANYWHERE)
// =======================================
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      username: username?.trim(),
      password: password?.trim()
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password."
      });
    }

    return res.status(200).json({
      success: true,
      name: user.name,
      role: user.role,
      username: user.username
    });

  } catch (error) {
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
  console.log("🔥 Login Server running on port 7003 (NO CORS)");
});
