// generateToken.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

// 1. Get secret key from .env
const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
  console.error("❌ JWT_SECRET not found in .env");
  process.exit(1);
}

// 2. Define the payload (data inside the token)
const payload = {
  id: "user123",
  name: "Pulkit Sharma",
  role: "admin",
};

// 3. Define token options
const options = {
  algorithm: "HS256",
  expiresIn: "1h",
  issuer: "auth-server",
  audience: "my-api",
};

// 4. Generate the JWT
const token = jwt.sign(payload, SECRET_KEY, options);

// 5. Print the token
console.log("✅ JWT Token generated successfully:\n");
console.log(token);
