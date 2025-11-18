// verifyToken.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

// Load secret key from .env
const SECRET_KEY = process.env.JWT_SECRET;

const token = "xxx";

try {
  // Verify and decode the token
  const decoded = jwt.verify(token, SECRET_KEY);

  console.log("✅ Token is valid!");
  console.log("Decoded Payload:", decoded);
} catch (err) {
  console.error("❌ Token verification failed:");
  console.error(err.message);
}
