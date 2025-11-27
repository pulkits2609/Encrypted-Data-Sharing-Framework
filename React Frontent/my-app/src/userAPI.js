// ===============================
// 🌐 USER API ENDPOINTS
// ===============================
const USER_SERVER = "https://user.pulkitworks.info";
const KEYS_SERVER = "https://keys.pulkitworks.info";
const FILE_SERVER = "https://core.pulkitworks.info";

// ===============================
// 📌 1. GET USER'S TEAMS
// ===============================
export async function getMyTeams(username) {
  try {
    const response = await fetch(`${USER_SERVER}/teams/my`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    return await response.json();
  } catch {
    return { success: false };
  }
}

// ===============================
// 📌 2. GET PUBLIC KEY OF TEAM
// ===============================
export async function getPublicKey(teamName) {
  try {
    const JWT = localStorage.getItem("userToken");
    if (!JWT) return { success: false, error: "Session expired." };

    const response = await fetch(`${USER_SERVER}/teams/publickey`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ JWT, teamName }),
    });

    return await response.json();
  } catch {
    return { success: false, error: "Unable to fetch public key." };
  }
}

// ===============================
// 📌 3. GET FILE LIST OF TEAM
// ===============================
export async function getTeamFiles(teamName) {
  try {
    const response = await fetch(`${FILE_SERVER}/team/list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamName }),
    });

    return await response.json();
  } catch {
    return { success: false, files: [] };
  }
}

// ===============================
// 📌 4. UPLOAD SINGLE ENCRYPTED FILE
// ===============================
export async function uploadEncryptedFile(file, teamName, publicKey) {
  try {
    const form = new FormData();
    form.append("file", file);
    form.append("publicKey", publicKey);
    form.append("teamName", teamName);

    const response = await fetch(`${FILE_SERVER}/file/encrypt`, {
      method: "POST",
      body: form,
    });

    return await response.json();
  } catch (err) {
    return { success: false, error: "Upload failed." };
  }
}

// ===============================
// 📌 5. UPLOAD MULTIPLE ENCRYPTED FILES
// ===============================
export async function uploadEncryptedFiles(files, teamName, publicKey) {
  const results = [];

  for (const file of files) {
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("publicKey", publicKey);
      form.append("teamName", teamName);

      const response = await fetch(`${FILE_SERVER}/file/encrypt`, {
        method: "POST",
        body: form,
      });

      const data = await response.json();
      results.push({ file: file.name, ...data });

    } catch {
      results.push({
        file: file.name,
        success: false,
        error: "Upload failed.",
      });
    }
  }

  return results;
}
