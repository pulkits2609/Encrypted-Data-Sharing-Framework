"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ManagerNavbar from "@/components/managerNavbar";

import {
  getTeamDetails,
  getAllUsers,
  updateTeamMembers,
  fetchTeamKeys,
  regenerateTeamKeys,
} from "@/managerAPI";

import { getTeamFiles } from "@/userAPI";

import "./manager.css";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { checkManager } from "@/validation/checkManager";

const getManagerToken = () => localStorage.getItem("managerToken");

export default function ManageTeam() {
  useEffect(() => {
    let intervalId;

    async function verifyToken() {
      await checkManager();
    }

    verifyToken();
    intervalId = setInterval(verifyToken, 15000);

    return () => clearInterval(intervalId);
  }, []);

  const { teamName } = useParams();
  const decodedName = decodeURIComponent(teamName);

  const [team, setTeam] = useState(null);
  const [addMode, setAddMode] = useState(false);
  const [manageMode, setManageMode] = useState(false);

  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [removeList, setRemoveList] = useState([]);

  const [keys, setKeys] = useState(null);
  const [loadingKeys, setLoadingKeys] = useState(true);

  const [teamFiles, setTeamFiles] = useState([]);
  const [keyWarning, setKeyWarning] = useState(false);

  const loadTeamDetails = async () => {
    const result = await getTeamDetails(decodedName);
    if (result.success) setTeam(result.team);
  };

  const loadTeamKeys = async () => {
    const result = await fetchTeamKeys(decodedName);

    if (result.success) {
      setKeys(result.keys);
    }

    setLoadingKeys(false);
  };

  const loadTeamFileList = async () => {
    const fileResult = await getTeamFiles(decodedName);
    setTeamFiles(fileResult.success ? fileResult.files : []);
  };

  useEffect(() => {
    loadTeamDetails();
    loadTeamKeys();
    loadTeamFileList();
  }, [decodedName]);

  const enterAddMode = async () => {
    const result = await getAllUsers();
    if (!result.success || !team) return;

    const allUsers = result.users;
    const teamMembers = team?.members || [];

    const filtered = allUsers.filter(
      (u) => !teamMembers.some((m) => m.username === u.username)
    );

    setAvailableUsers(filtered);
    setAddMode(true);
    setManageMode(false);
    setSelectedUsers([]);
  };

  const toggleUser = (user) => {
    setSelectedUsers((prev) =>
      prev.includes(user)
        ? prev.filter((u) => u !== user)
        : [...prev, user]
    );
  };

  const saveAddMode = async () => {
    const updatedMembers = [
      ...(team?.members || []),
      ...selectedUsers.map((u) => ({ username: u.username, name: u.name })),
    ];

    const result = await updateTeamMembers(decodedName, updatedMembers);

    if (result.success) {
      setAddMode(false);
      setSelectedUsers([]);
      loadTeamDetails();
    }
  };

  const enterManageMode = () => {
    setManageMode(true);
    setAddMode(false);
    setRemoveList([]);
  };

  const toggleRemove = (member) => {
    setRemoveList((prev) =>
      prev.includes(member)
        ? prev.filter((m) => m !== member)
        : [...prev, member]
    );
  };

  const saveManageMode = async () => {
    const updatedMembers = team.members.filter(
      (m) => !removeList.includes(m)
    );

    const result = await updateTeamMembers(decodedName, updatedMembers);

    if (result.success) {
      setManageMode(false);
      setRemoveList([]);
      loadTeamDetails();
    }
  };

  // -------------------------------------------
  // SAFE KEY REGEN
  // -------------------------------------------
  const regenerateKeys = async () => {
    if (teamFiles.length > 0) {
      setKeyWarning(true);
      return;
    }

    const token = getManagerToken();
    const result = await regenerateTeamKeys(token, decodedName);

    if (result.success) {
      loadTeamKeys();
    }
  };

  return (
    <>
      <ManagerNavbar />

      <div className="min-h-screen bg-[#111418] p-6 text-white flex gap-6">

        {/* LEFT PANEL */}
        <div className="w-2/3 bg-[#1a1d21] p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-1">{team?.teamName || "Loading..."}</h1>
          <h2 className="text-xl text-gray-300 mb-6">
            Project: {team?.projectName || "Loading..."}
          </h2>

          {/* NORMAL MODE */}
          {!addMode && !manageMode && (
            <>
              {!team?.members?.length ? (
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

          {/* ADD MODE */}
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

          {/* MANAGE MODE */}
          {manageMode && (
            <>
              {!team?.members?.length ? (
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

        {/* RIGHT PANEL — KEYS */}
        <div className="w-1/3 bg-[#1a1d21] p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Team Keys</h2>

          {loadingKeys && <p className="text-gray-400">Loading keys...</p>}
          {!loadingKeys && !keys && (
            <p className="text-gray-400">No keys generated yet.</p>
          )}

          {keys && (
            <>
              <div className="bg-[#0f1214] p-4 rounded-lg mb-4 border border-gray-700 h-48 overflow-auto">
                <h3 className="text-lg font-semibold mb-2 text-green-400">
                  PUBLIC KEY
                </h3>
                <pre className="text-xs leading-tight text-gray-300 break-all whitespace-pre-wrap">
                  {keys.publicKey}
                </pre>
              </div>

              <div className="bg-[#0f1214] p-4 rounded-lg mb-4 border border-gray-700 h-48 overflow-auto">
                <h3 className="text-lg font-semibold mb-2 text-red-400">
                  PRIVATE KEY
                </h3>
                <pre className="text-xs leading-tight text-gray-300 break-all whitespace-pre-wrap">
                  {keys.privateKey}
                </pre>
              </div>

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

      {/* REGEN WARNING POPUP */}
      {keyWarning && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-[#1a1d21] p-6 rounded-xl border border-gray-600 w-96 text-center">
            <h2 className="text-xl mb-4 font-semibold text-red-400">
              Cannot Regenerate Keys
            </h2>

            <p className="text-gray-300 mb-6">
              Please delete all existing files in this team before regenerating the RSA keys.
            </p>

            <button
              className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 w-28"
              onClick={() => setKeyWarning(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
