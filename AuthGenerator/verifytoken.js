// verifyToken.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

// Load secret key from .env
const SECRET_KEY = process.env.JWT_SECRET;

// Paste the token you generated earlier 👇
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXIxMjMiLCJuYW1lIjoiUHVsa2l0IFNoYXJtYSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MjIzNzY3NCwiZXhwIjoxNzYyMjQxMjc0LCJhdWQiOiJteS1hcGkiLCJpc3MiOiJhdXRoLXNlcnZlciJ9.uGl5StsqJ9sD7ffKTXlCdNsYMHPj1zYWknlamyk9bgI";

try {
  // Verify and decode the token
  const decoded = jwt.verify(token, SECRET_KEY);

  console.log("✅ Token is valid!");
  console.log("Decoded Payload:", decoded);
} catch (err) {
  console.error("❌ Token verification failed:");
  console.error(err.message);
}
