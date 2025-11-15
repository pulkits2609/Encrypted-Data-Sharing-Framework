const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Correct MongoDB URL (make sure your MongoDB is running)
const mongoURL = "mongodb+srv://DsUser:dsadmin14@inventorycluster.czhlw69.mongodb.net/DataSecurity?retryWrites=true&w=majority&appName=InventoryCluster";
// Connect to MongoDB
(async () => {
  try {
    await mongoose.connect(mongoURL);
    console.log("✅ Connected to MongoDB (DataSecurity)");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
})();

// ✅ Define schema with exact collection name
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true }
}, { collection: 'users' }); // 👈 Important: explicitly use 'users' collection

// Create model bound to that collection
const User = mongoose.model('User', userSchema);

// ✅ Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username?.trim() || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required."
      });
    }

    // Find the user inside DataSecurity.users
    const user = await User.findOne({
      username: username.trim(),
      password: password.trim()
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password."
      });
    }

    // ✅ Success
    return res.status(200).json({
      success: true,
      message: "Login successful!",
      name: user.name,
      role: user.role,
      username: user.username
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
