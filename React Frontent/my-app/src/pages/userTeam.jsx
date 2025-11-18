"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import UserNavbar from "@/components/userNavbar";
import FileUploader from "@/components/fileUploader";

import { getPublicKey, getTeamFiles } from "@/userAPI";

import { checkUser } from "@/validation/checkUser";

export default function UserTeam() {
  const { teamName } = useParams();

  const [publicKey, setPublicKey] = useState("");
  const [files, setFiles] = useState([]);
  const [loadingKey, setLoadingKey] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(true);

  // -----------------------------------------
  // 🔐 AUTO TOKEN CHECK (EVERY 15 SECONDS)
  // -----------------------------------------
  useEffect(() => {
    let intervalId;

    async function verifyLoop() {
      await checkUser(); // auto redirect if invalid
    }

    verifyLoop();
    intervalId = setInterval(verifyLoop, 15000);

    return () => clearInterval(intervalId);
  }, []);

  // -----------------------------------------
  // 🔄 LOAD FILES
  // -----------------------------------------
  const loadFiles = async () => {
    setLoadingFiles(true);
    const fileResult = await getTeamFiles(teamName);
    setFiles(fileResult.success ? fileResult.files : []);
    setLoadingFiles(false);
  };

  // -----------------------------------------
  // 🔄 LOAD PUBLIC KEY + FILE LIST
  // -----------------------------------------
  useEffect(() => {
    const loadData = async () => {
      // PUBLIC KEY
      setLoadingKey(true);
      const keyResult = await getPublicKey(teamName);

      if (keyResult.success) {
        setPublicKey(keyResult.publicKey);
      } else {
        setPublicKey(
          "⚠ Unable to load public key.\n" + (keyResult.error || "")
        );
      }
      setLoadingKey(false);

      // TEAM FILES
      await loadFiles();
    };

    loadData();
  }, [teamName]);

  return (
    <>
      <UserNavbar />

      <div className="min-h-screen bg-[#111418] p-10 text-white">
        <h1 className="text-3xl font-bold mb-8">
          Team: <span className="text-blue-400">{teamName}</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* LEFT — FILE UPLOADER */}
          <div className="bg-[#1a1d21] border border-[#2a2f35] rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Upload Files</h2>

            <FileUploader
              teamName={teamName}
              publicKey={publicKey}
              onUploadComplete={loadFiles}
            />
          </div>

          {/* RIGHT — PUBLIC KEY + FILES */}
          <div className="space-y-8">

            {/* PUBLIC KEY */}
            <div className="bg-[#1a1d21] border border-[#2a2f35] rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Team Public Key</h2>

              {loadingKey ? (
                <p className="text-gray-400">Loading public key...</p>
              ) : (
                <div className="bg-[#0f1214] p-4 rounded-xl border border-gray-800 max-h-[250px] overflow-auto">
                  <p className="font-mono text-xs leading-tight whitespace-pre-wrap break-all">
                    {publicKey}
                  </p>
                </div>
              )}
            </div>

            {/* FILE LIST */}
            <div className="bg-[#1a1d21] border border-[#2a2f35] rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Team Folder Files</h2>

              {loadingFiles ? (
                <p className="text-gray-400">Loading files...</p>
              ) : files.length === 0 ? (
                <p className="text-gray-400">No files found.</p>
              ) : (
                <ul className="space-y-3">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="flex justify-between p-3 bg-[#0f1214] rounded-lg border border-gray-800"
                    >
                      <span>{file}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
