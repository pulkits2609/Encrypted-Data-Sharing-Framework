// src/managerAPI.js

// ==============================
// CENTRALIZED BASE URLS
// ==============================
const MANAGER_SERVER = "https://dsapi.pulkitworks.info/manager";
const FILE_SERVER = "https://dsapi.pulkitworks.info/files";
const KEY_SERVER = "https://dsapi.pulkitworks.info/keys";

// ==============================
// GET ALL TEAMS
// ==============================
export async function getTeams() {
  try {
    const response = await fetch(`${MANAGER_SERVER}/teams`);
    return await response.json();
  } catch {
    return { success: false, error: "Unable to fetch teams" };
  }
}

// ==============================
// GET TEAM DETAILS
// ==============================
export async function getTeamDetails(teamName) {
  try {
    const response = await fetch(`${MANAGER_SERVER}/teams/manage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamName }),
    });

    return await response.json();
  } catch {
    return { success: false, error: "Unable to fetch team details" };
  }
}

// ==============================
// GET ALL USERS
// ==============================
export async function getAllUsers() {
  try {
    const response = await fetch(`${MANAGER_SERVER}/users/all`);
    return await response.json();
  } catch {
    return { success: false, error: "Unable to fetch users" };
  }
}

// ==============================
// UPDATE TEAM MEMBERS
// ==============================
export async function updateTeamMembers(teamName, members) {
  try {
    const response = await fetch(`${MANAGER_SERVER}/teams/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamName, members }),
    });

    return await response.json();
  } catch {
    return { success: false, error: "Unable to update team" };
  }
}

// ==============================
// FETCH KEYS FOR TEAM
// ==============================
export async function fetchTeamKeys(teamName) {
  try {
    const token = localStorage.getItem("managerToken");

    const response = await fetch(`${KEY_SERVER}/existing/fetch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ teamName }),
    });

    return await response.json();
  } catch {
    return { success: false, error: "Unable to fetch keys" };
  }
}

// ==============================
// REGENERATE KEYS FOR TEAM
// ==============================
export async function regenerateTeamKeys(token, teamName) {
  try {
    const response = await fetch(`${KEY_SERVER}/existing/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ teamName }),
    });

    return await response.json();
  } catch {
    return { success: false, error: "Unable to regenerate keys" };
  }
}

// ==============================
// CREATE NEW USER
// ==============================
export async function createNewUser(username, password, name, role) {
  try {
    const response = await fetch(`${MANAGER_SERVER}/user/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, name, role }),
    });

    return await response.json();
  } catch {
    return { success: false, error: "Unable to create user" };
  }
}

// ==============================
// CREATE NEW TEAM
// ==============================
export async function createNewTeam(teamName, projectName, members) {
  const managerToken = localStorage.getItem("managerToken");

  try {
    const response = await fetch(`${MANAGER_SERVER}/teams/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamName,
        projectName,
        members,
        managerToken,
      }),
    });

    return await response.json();
  } catch {
    return { success: false, error: "Unable to create team" };
  }
}

// ==============================
// DELETE FILE (MANAGER ONLY)
// ==============================
export async function deleteTeamFile(teamName, fileName) {
  try {
    const token = localStorage.getItem("managerToken");

    const response = await fetch(`${FILE_SERVER}/file/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ teamName, fileName }),
    });

    return await response.json();
  } catch {
    return { success: false, error: "Unable to delete file" };
  }
}
