// src/auth.js

// ==============================
// 🔧 API BASE URLs
// ==============================
export const LOGIN_API = "https://auth.pulkitworks.info";
export const GENERATOR_API = "https://jwtgen.pulkitworks.info";
export const VERIFIER_API = "https://jwtverify.pulkitworks.info";

//RETURN TOKEN 
export function getToken() {
  console.log(localStorage.getItem("managerToken") ||
    localStorage.getItem("userToken") ||
    localStorage.getItem("jwt") ||
    null)
  return (
    localStorage.getItem("managerToken") ||
    localStorage.getItem("userToken") ||
    localStorage.getItem("jwt") ||
    null
  );
}


// ==============================
// 🔑 1. LOGIN USER
// ==============================
export async function loginUser(username, password) {
  try {
    const response = await fetch(`${LOGIN_API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (!data.success) return { success: false, message: data.message };

    return {
      success: true,
      name: data.name,
      role: data.role,
      username: data.username,
    };
  } catch {
    return { success: false, message: "Server connection failed" };
  }
}

// ==============================
// 🔧 2. GENERATE JWT
// ==============================
export async function generateToken(username, role, department = "IT") {
  try {
    const response = await fetch(`${GENERATOR_API}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, department, role }),
    });

    const data = await response.json();
    if (!data.success) return { success: false, message: data.message };

    saveToken(data.token);
    localStorage.setItem("jwt", data.token);

    return {
      success: true,
      token: data.token,
      expiresAt: data.expiresAtIST,
    };
  } catch {
    return { success: false, message: "Generator server unreachable" };
  }
}

// ==============================
// 🔍 3. VERIFY JWT
// ==============================
export async function verifyToken() {
  const token = getToken();
  if (!token) return { success: false, message: "No token found" };

  try {
    const response = await fetch(`${VERIFIER_API}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    return await response.json();
  } catch {
    return { success: false, message: "Verifier server unreachable" };
  }
}

// small helper so generateToken() can call this safely
export function saveToken(token) {
  try {
    localStorage.setItem("jwt", token);
  } catch (e) {
    // ignore storage errors in very restricted environments
    console.error("Failed to save token:", e);
  }
}