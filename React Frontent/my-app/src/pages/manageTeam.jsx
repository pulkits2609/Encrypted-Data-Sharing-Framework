"use client"
console.log("ManageTeam component loaded!");


import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import ManagerNavbar from "@/components/managerNavbar"

import {
  getTeamDetails,
  getAllUsers,
  updateTeamMembers,
  fetchTeamKeys,
  regenerateTeamKeys,
} from "../managerAPI"

import "./manager.css"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// 🔥 UTILITY TO GET JWT OF MANAGER FROM LOCAL STORAGE
const getManagerToken = () => localStorage.getItem("managerToken")

export default function ManageTeam() {
  const { teamName } = useParams()
  const decodedName = decodeURIComponent(teamName)

  // TEAM DETAILS
  const [team, setTeam] = useState(null)

  // MODE STATES (LEFT PANEL)
  const [addMode, setAddMode] = useState(false)
  const [manageMode, setManageMode] = useState(false)

  const [availableUsers, setAvailableUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [removeList, setRemoveList] = useState([])

  // RIGHT PANEL: KEYS
  const [keys, setKeys] = useState(null)
  const [loadingKeys, setLoadingKeys] = useState(true)

  // ===============================
  // LOAD TEAM DETAILS
  // ===============================
  const loadTeamDetails = async () => {
    const result = await getTeamDetails(decodedName)
    if (result.success) setTeam(result.team)
  }

  // ===============================
  // LOAD TEAM KEYS (RIGHT PANEL)
  // ===============================
  const loadTeamKeys = async () => {
    console.log("loadTeamKeys() started");

    const token = localStorage.getItem("managerToken");
    console.log("Token found:", token);

    const result = await fetchTeamKeys(decodedName);

    console.log("Key fetch result: ", result);

    if (result.success) {
      setKeys(result.keys);
    }
  };


  // FETCH TEAM + KEYS ON PAGE LOAD
  useEffect(() => {
    console.log("Calling loadTeamKeys()...");
    loadTeamDetails();
    loadTeamKeys();
  }, [decodedName]);


  // ===============================
  // ADD MODE
  // ===============================
  const enterAddMode = async () => {
    const result = await getAllUsers()
    if (!result.success || !team) return

    const allUsers = result.users
    const teamMembers = team?.members || []

    const filtered = allUsers.filter(
      (u) => !teamMembers.some((m) => m.username === u.username)
    )

    setAvailableUsers(filtered)
    setAddMode(true)
    setManageMode(false)
    setSelectedUsers([])
  }

  const toggleUser = (user) => {
    setSelectedUsers((prev) =>
      prev.includes(user)
        ? prev.filter((u) => u !== user)
        : [...prev, user]
    )
  }

  const saveAddMode = async () => {
    const updatedMembers = [
      ...(team?.members || []),
      ...selectedUsers.map((u) => ({ username: u.username, name: u.name })),
    ]

    const result = await updateTeamMembers(decodedName, updatedMembers)

    if (result.success) {
      setAddMode(false)
      setSelectedUsers([])
      loadTeamDetails()
    }
  }

  // ===============================
  // MANAGE EXISTING MODE
  // ===============================
  const enterManageMode = () => {
    setManageMode(true)
    setAddMode(false)
    setRemoveList([])
  }

  const toggleRemove = (member) => {
    setRemoveList((prev) =>
      prev.includes(member)
        ? prev.filter((m) => m !== member)
        : [...prev, member]
    )
  }

  const saveManageMode = async () => {
    const updatedMembers = team.members.filter(
      (m) => !removeList.includes(m)
    )

    const result = await updateTeamMembers(decodedName, updatedMembers)

    if (result.success) {
      setManageMode(false)
      setRemoveList([])
      loadTeamDetails()
    }
  }

  // ===============================
  // REGENERATE KEYS (RIGHT PANEL)
  // ===============================
  const regenerateKeys = async () => {
    const token = getManagerToken()

    const result = await regenerateTeamKeys(token, decodedName)

    if (result.success) {
      alert("🔑 Keys regenerated successfully!")
      loadTeamKeys()
    } else {
      alert("Failed to regenerate keys.")
    }
  }

  // ===============================
  // RENDER UI
  // ===============================

  return (
    <>
      <ManagerNavbar />

      <div className="min-h-screen bg-[#111418] p-6 text-white flex gap-6">

        {/* LEFT PANEL (UNCHANGED) */}
        <div className="w-2/3 bg-[#1a1d21] p-6 rounded-lg">
          
          {/* HEADINGS */}
          <h1 className="text-3xl font-bold mb-1">{team?.teamName || "Loading..."}</h1>
          <h2 className="text-xl text-gray-300 mb-6">
            Project: {team?.projectName || "Loading..."}
          </h2>

          {/* ================= NORMAL MODE ================= */}
          {!addMode && !manageMode && (
            <>
              {(!team || team.members?.length === 0) ? (
                <p className="text-gray-400 mb-6">No members currently.</p>
              ) : (
                <Table className="text-gray-200 mb-6">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Name</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {team.members.map((m, i) => (
                      <TableRow key={i} className="hover:bg-[#2a2f35]">
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{m.username}</TableCell>
                        <TableCell>{m.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              <div className="flex gap-4 mt-4">
                <button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  onClick={enterAddMode}
                >
                  Add Member
                </button>

                <button
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                  onClick={enterManageMode}
                >
                  Manage Existing
                </button>
              </div>
            </>
          )}

          {/* ================= ADD MODE ================= */}
          {addMode && (
            <>
              <Table className="text-gray-200 mb-6">
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {availableUsers.map((user, i) => (
                    <TableRow key={i} className="hover:bg-[#2a2f35]">
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user)}
                          onChange={() => toggleUser(user)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                onClick={saveAddMode}
              >
                Save Changes
              </button>
            </>
          )}

          {/* ================= MANAGE MODE ================= */}
          {manageMode && (
            <>
              {(!team || team.members?.length === 0) ? (
                <p className="text-gray-400 mb-6">No members currently.</p>
              ) : (
                <Table className="text-gray-200 mb-6">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No.</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {team.members.map((m, i) => (
                      <TableRow key={i} className="hover:bg-[#2a2f35]">
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{m.username}</TableCell>
                        <TableCell>{m.name}</TableCell>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={removeList.includes(m)}
                            onChange={() => toggleRemove(m)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                onClick={saveManageMode}
              >
                Remove Selected
              </button>
            </>
          )}

        </div>

        {/* ===================================================
            RIGHT PANEL — KEYS SECTION (FULLY IMPLEMENTED)
        =================================================== */}
        <div className="w-1/3 bg-[#1a1d21] p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Team Keys</h2>

          {/* LOADING STATE */}
          {loadingKeys && <p className="text-gray-400">Loading keys...</p>}

          {/* NO KEYS */}
          {!loadingKeys && !keys && (
            <p className="text-gray-400">No keys generated yet.</p>
          )}

          {/* KEYS DISPLAY */}
          {keys && (
            <>

              {/* PUBLIC KEY BOX */}
              <div className="bg-[#0f1214] p-4 rounded-lg mb-4 border border-gray-700">
                <h3 className="text-lg font-semibold mb-2 text-green-400">
                  PUBLIC KEY
                </h3>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {keys.publicKey}
                </pre>
              </div>

              {/* PRIVATE KEY BOX */}
              <div className="bg-[#0f1214] p-4 rounded-lg mb-4 border border-gray-700">
                <h3 className="text-lg font-semibold mb-2 text-red-400">
                  PRIVATE KEY
                </h3>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {keys.privateKey}
                </pre>
              </div>

              {/* REGENERATE BUTTON */}
              <button
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold rounded-lg w-full mt-4"
                onClick={regenerateKeys}
              >
                🔄 Regenerate Keys
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
