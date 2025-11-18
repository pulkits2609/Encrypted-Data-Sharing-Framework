"use client";

import { useEffect, useState } from "react";
import ManagerNavbar from "@/components/managerNavbar";
import { getAllUsers, createNewTeam } from "../managerAPI";
import { checkManager } from "@/validation/checkManager";

export default function CreateNewTeam() {
  const [teamName, setTeamName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔐 Auto token validation
  useEffect(() => {
    let intervalId;
    const verify = async () => await checkManager();

    verify();
    intervalId = setInterval(verify, 15000);

    return () => clearInterval(intervalId);
  }, []);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      const result = await getAllUsers();
      if (result.success) setUsers(result.users);
    };
    loadUsers();
  }, []);

  const toggleUser = (user) => {
    setSelectedUsers((prev) =>
      prev.includes(user)
        ? prev.filter((u) => u !== user)
        : [...prev, user]
    );
  };

  const handleCreateTeam = async () => {
    if (!teamName || !projectName) {
      alert("Team name and project name are required!");
      return;
    }

    if (selectedUsers.length === 0) {
      alert("Select at least one member!");
      return;
    }

    setLoading(true);

    const members = selectedUsers.map((u) => ({
      username: u.username,
      name: u.name,
    }));

    const result = await createNewTeam(teamName, projectName, members);

    setLoading(false);

    if (result.success) {
      alert("Team created successfully!");
      setTeamName("");
      setProjectName("");
      setSelectedUsers([]);
    } else {
      alert(result.error || "Failed to create team.");
    }
  };

  return (
    <>
      <ManagerNavbar />

      <div className="min-h-screen bg-[#111418] flex justify-center p-6 text-white">
        <div className="w-full max-w-4xl bg-[#1a1d21] p-10 rounded-2xl shadow-lg border border-[#2a2f35]">

          <h1 className="text-3xl font-bold mb-8 text-center">Create New Team</h1>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <label className="block mb-2 text-sm font-medium">Team Name</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg bg-[#0f1214] border border-gray-700"
                placeholder="Enter team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Project Name</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg bg-[#0f1214] border border-gray-700"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
          </div>

          {/* Member Selection */}
          <h2 className="text-xl font-semibold mb-4">Select Members</h2>

          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-2">Username</th>
                <th className="p-2">Name</th>
                <th className="p-2 text-center">Select</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={i} className="hover:bg-[#2a2f35]">
                  <td className="p-2">{user.username}</td>
                  <td className="p-2">{user.name}</td>
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user)}
                      onChange={() => toggleUser(user)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Button */}
          <button
            onClick={handleCreateTeam}
            disabled={loading}
            className="mt-10 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg"
          >
            {loading ? "Creating..." : "Create Team"}
          </button>

        </div>
      </div>
    </>
  );
}
