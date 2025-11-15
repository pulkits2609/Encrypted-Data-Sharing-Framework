// ==============================
// 🔧 API BASE URLs
// ==============================
export const LOGIN_API = "http://localhost:3000";
export const GENERATOR_API = "http://localhost:4001";
export const VERIFIER_API = "http://localhost:4000";

// ==============================
// 🔐 Token Handling
// ==============================
export let TEMP_JWT = null;

export function saveToken(token) {
  TEMP_JWT = token;
}

export function getToken() {
  return TEMP_JWT;
}

export function clearToken() {
  TEMP_JWT = null;
}

// ==============================
// 🔑 1. LOGIN → Fetch Name + Role
// ==============================
export async function loginUser(username, password) {
  try {
    const response = await fetch(`${LOGIN_API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!data.success) {
      return { success: false, message: data.message };
    }

    return {
      success: true,
      name: data.name,
      role: data.role,
      username: data.username,
    };


  } catch (err) {
    console.error("Login error:", err);
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
``
    const data = await response.json();

    if (!data.success) {
      return { success: false, message: data.message };
    }

    saveToken(data.token);
    localStorage.setItem("jwt", data.token);

    return {
      success: true,
      token: data.token,
      expiresAt: data.expiresAtIST,
    };

  } catch (err) {
    console.error("Token generation error:", err);
    return { success: false, message: "Generator server unreachable" };
  }
}

// ==============================
// 🔍 3. VERIFY JWT
// ==============================
export async function verifyToken() {
  const token = getToken();

  if (!token) {
    return { success: false, message: "No token found" };
  }

  try {
    const response = await fetch(`${VERIFIER_API}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    return data;

  } catch (err) {
    console.error("Verifier error:", err);
    return { success: false, message: "Verifier server unreachable" };
  }
}
