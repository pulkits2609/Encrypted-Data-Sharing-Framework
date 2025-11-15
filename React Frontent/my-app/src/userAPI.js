const USER_SERVER = "http://localhost:7500";
const KEYS_SERVER = "http://localhost:7200";

// ---------------------------
// Get all teams user belongs to
// ---------------------------
export async function getMyTeams(username) {
  try {
    const response = await fetch(`${USER_SERVER}/teams/my`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    return await response.json();
  } catch (err) {
    console.error("Error fetching user teams:", err);
    return { success: false };
  }
}

// ---------------------------
// Fetch public key (REAL API)
// ---------------------------
export async function getPublicKey(teamName) {
  try {
    const JWT = localStorage.getItem("userToken");  // fetch user token

    if (!JWT) {
      return {
        success: false,
        error: "User token missing. Please login again."
      };
    }

    const response = await fetch(`${USER_SERVER}/teams/publickey`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ JWT, teamName }),
    });

    return await response.json();
  } catch (err) {
    console.error("Error fetching public key:", err);
    return { success: false };
  }
}

// ------------------------------------
// TEMP FUNCTION (can remove later)
// Get Public Key Mock
// ------------------------------------
export async function getTeamPublicKey(teamName) {
  try {
    console.log("Fetching public key for:", teamName);

    return {
      success: true,
      publicKey: `-----BEGIN PUBLIC KEY-----
TEMPORARY_PUBLIC_KEY_FOR_${teamName}_12345
-----END PUBLIC KEY-----`,
    };
  } catch (err) {
    console.error("getTeamPublicKey() Error:", err);
    return { success: false, publicKey: "" };
  }
}

// ------------------------------------
// TEMP FUNCTION (mock file list)
// ------------------------------------
export async function getTeamFiles(teamName) {
  try {
    console.log("Fetching file list for:", teamName);

    return {
      success: true,
      files: [
        "report-final.pdf",
        "design-sketch.png",
        "module-notes.docx",
        "requirements-v2.xlsx",
      ],
    };
  } catch (err) {
    console.error("getTeamFiles() Error:", err);
    return { success: false, files: [] };
  }
}
