// frontend/src/api/managerAPI.js

const BASE_URL = "http://localhost:7000"; //Manager specific API 
const KEYS_SERVER = "http://localhost:7200";

export async function getTeams() {
  try {
    const response = await fetch(`${BASE_URL}/teams`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching teams:", error);
    return { success: false };
  }
}

export async function getTeamDetails(teamName) {
  try {
    const response = await fetch("http://localhost:7000/teams/manage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ teamName }),
    });

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error fetching team details:", error);
    return { success: false };
  }
}

export async function getAllUsers() {
  try {
    const response = await fetch("http://localhost:7000/users/all");
    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false };
  }
}

export async function updateTeamMembers(teamName, members) {
  try {
    const response = await fetch("http://localhost:7000/teams/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamName, members }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error updating team:", error);
    return { success: false };
  }
}

// --------------------------------------
// FETCH EXISTING KEYS OF A TEAM (MANAGER)
// --------------------------------------
// 🔹 Fetch keys for a specific team
export async function fetchTeamKeys(teamName) {
  try {
    const token = localStorage.getItem("managerToken");

    const response = await fetch(`${KEYS_SERVER}/existing/fetch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,   // send JWT in header ✔
      },
      body: JSON.stringify({ teamName }),
    });

    return await response.json();

  } catch (err) {
    console.error("Fetch keys error:", err);
    return { success: false, error: "Server unreachable" };
  }
}

// --------------------------------------
// REGENERATE KEYS FOR A TEAM (MANAGER)
// --------------------------------------
export async function regenerateTeamKeys(token, teamName) {
  try {
    const response = await fetch(`${KEYS_SERVER}/existing/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,     // manager token
      },
      body: JSON.stringify({ teamName }),
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error regenerating keys:", err);
    return { success: false };
  }
}

//Create new user

export async function createNewUser(username, password, name, role) {
  try {
    const response = await fetch("http://localhost:7000/user/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, name, role })
    });

    return await response.json();
  } catch (err) {
    console.error("Create user error:", err);
    return { success: false, error: "Server unreachable" };
  }
}
// CREATE NEW TEAM
export async function createNewTeam(teamName, projectName, members) {
   const managerToken = localStorage.getItem("managerToken");
  try {
    const response = await fetch("http://localhost:7000/teams/new", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    teamName,
    projectName,
    members,
    managerToken               // ADD THIS
  }),
});

    return await response.json();
  } catch (err) {
    console.error("Create team error:", err);
    return { success: false, error: "Server unreachable" };
  }
}
