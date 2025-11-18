"use client";

import { useEffect, useState } from "react";
import ManagerNavbar from "@/components/managerNavbar";
import { getTeams } from "@/managerAPI";
import { getTeamFiles } from "@/userAPI";
import { fetchTeamKeys, deleteTeamFile } from "@/managerAPI";
import { XCircle } from "lucide-react";
import { checkManager } from "@/validation/checkManager";

const FILE_SERVER = "https://dsapi.pulkitworks.info/files";

export default function ManagerFiles() {
  const [teams, setTeams] = useState([]);
  const [teamFiles, setTeamFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState("");
  const [deleting, setDeleting] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  // TOKEN CHECK
  useEffect(() => {
    let intervalId;

    async function validateToken() {
      await checkManager();
    }

    validateToken();
    intervalId = setInterval(validateToken, 15000);

    return () => clearInterval(intervalId);
  }, []);

  // LOAD TEAMS + FILES
  useEffect(() => {
    async function loadAll() {
      const result = await getTeams();

      if (result.success) {
        setTeams(result.teams);
        await loadFilesForTeams(result.teams);
      }

      setLoading(false);
    }

    loadAll();
  }, []);

  async function loadFilesForTeams(teamsList) {
    const map = {};

    for (const team of teamsList) {
      const fileResult = await getTeamFiles(team.teamName);
      map[team.teamName] = fileResult.success ? fileResult.files : [];
    }

    setTeamFiles(map);
  }

  // DOWNLOAD & DECRYPT
  const handleDownload = async (teamName, fileName) => {
    try {
      setDownloading(fileName);

      const keyResult = await fetchTeamKeys(teamName);
      if (!keyResult.success) return;

      const privateKey = keyResult.keys.privateKey;

      const response = await fetch(`${FILE_SERVER}/file/decrypt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privateKey, teamName, fileName }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName.replace(".enc", "");
      a.click();
    } finally {
      setDownloading("");
    }
  };

  // DELETE FILE CONFIRM
  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;

    const { teamName, fileName } = confirmDelete;

    setDeleting(fileName);

    const result = await deleteTeamFile(teamName, fileName);

    if (result.success) {
      await loadFilesForTeams(teams);
    }

    setDeleting("");
    setConfirmDelete(null);
  };

  return (
    <>
      <ManagerNavbar />

      <div className="min-h-screen bg-[#111418] p-8 text-white">

        <h1 className="text-3xl font-bold mb-8">📁 Manager – All Team Files</h1>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {teams.map((team, idx) => (
              <div
                key={idx}
                className="bg-[#1a1d21] border border-[#2a2f35] rounded-xl p-6 shadow-lg"
              >
                <h2 className="text-2xl font-semibold text-blue-400 mb-1">
                  {team.teamName}
                </h2>

                <p className="text-gray-400 mb-4">
                  Project: <span className="text-gray-200">{team.projectName}</span>
                </p>

                <h3 className="text-lg font-medium mb-3">Encrypted Files</h3>

                {teamFiles[team.teamName]?.length === 0 ? (
                  <p className="text-gray-500">No files uploaded.</p>
                ) : (
                  <ul className="space-y-3">
                    {teamFiles[team.teamName].map((file, i) => (
                      <li
                        key={i}
                        className="flex justify-between items-center p-3 bg-[#0f1214] rounded-lg border border-gray-800"
                      >
                        <span>{file}</span>

                        <div className="flex items-center gap-4">

                          <button
                            className="text-blue-400 hover:underline disabled:text-gray-500"
                            onClick={() => handleDownload(team.teamName, file)}
                            disabled={downloading === file}
                          >
                            {downloading === file ? "Decrypting..." : "Download"}
                          </button>

                          <button
                            className="text-red-400 hover:text-red-300"
                            onClick={() =>
                              setConfirmDelete({ teamName: team.teamName, fileName: file })
                            }
                          >
                            <XCircle size={20} />
                          </button>

                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DELETE CONFIRM POPUP */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-[#1a1d21] p-6 rounded-xl border border-gray-600 w-96 text-center">

            <h2 className="text-xl mb-4 font-semibold">Delete File?</h2>

            <p className="text-gray-300 mb-6">
              Delete 
              <span className="text-red-400"> {confirmDelete.fileName}</span> ?
            </p>

            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
                onClick={confirmDeleteAction}
                disabled={deleting === confirmDelete.fileName}
              >
                {deleting === confirmDelete.fileName ? "Deleting..." : "Yes"}
              </button>

              <button
                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
