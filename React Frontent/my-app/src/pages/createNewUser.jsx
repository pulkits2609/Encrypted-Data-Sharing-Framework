"use client";

import { useState } from "react";
import ManagerNavbar from "@/components/managerNavbar";
import StrengthInput from "@/components/StrengthInput";

import { createNewUser } from "../managerAPI";

export default function CreateNewUser() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);

  // --------------------------
  // CREATE USER HANDLER
  // --------------------------
  const handleCreate = async () => {
    if (!username || !password || !name || !role) {
      alert("All fields are required!");
      return;
    }

    setLoading(true);

    const result = await createNewUser(username, password, name, role);

    setLoading(false);

    if (result.success) {
      alert("User created successfully!");
      setUsername("");
      setPassword("");
      setName("");
      setRole("user");
    } else {
      alert(result.error);
    }
  };

  return (
    <>
      <ManagerNavbar />

      <div className="min-h-screen bg-[#111418] flex items-center justify-center p-6 text-white overflow-hidden">
        <div className="w-full max-w-3xl bg-[#1a1d21] p-10 rounded-2xl shadow-lg border border-[#2a2f35]">

          <h1 className="text-3xl font-bold mb-8 text-center">
            Create New User
          </h1>

          {/* Username + Password Row */}
          <div className="grid grid-cols-2 gap-8">
            <StrengthInput
              label="Username"
              type="username"
              value={username}
              setValue={setUsername}
            />

            <StrengthInput
              label="Password"
              type="password"
              value={password}
              setValue={setPassword}
              passwordToCompare={username}
            />
          </div>

          {/* Full Name */}
          <div className="mt-8">
            <label className="block mb-2 text-sm font-medium">Full Name</label>
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-[#0f1214] border border-gray-700"
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Role Selection */}
          <div className="mt-8">
            <label className="block mb-3 text-sm font-medium">Role</label>

            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === "user"}
                  onChange={() => setRole("user")}
                />
                User
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="manager"
                  checked={role === "manager"}
                  onChange={() => setRole("manager")}
                />
                Manager
              </label>
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            disabled={loading}
            className="mt-10 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
          >
            {loading ? "Creating..." : "Create User"}
          </button>

        </div>
      </div>
    </>
  );
}
