"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import UserNavbar from "@/components/userNavbar";
import FileUploader from "@/components/fileUploader";

import { getPublicKey, getTeamFiles } from "@/userAPI";

export default function UserTeam() {
  const { teamName } = useParams();

  const [publicKey, setPublicKey] = useState("");
  const [files, setFiles] = useState([]);
  const [loadingKey, setLoadingKey] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // -------------------------
      // 1️⃣ LOAD PUBLIC KEY  
      // -------------------------
      setLoadingKey(true);
      const keyResult = await getPublicKey(teamName);

      if (keyResult.success) {
        setPublicKey(keyResult.publicKey);
      } else {
        setPublicKey("⚠ Unable to load public key.\n" + (keyResult.error || ""));
      }
      setLoadingKey(false);

      // -------------------------
      // 2️⃣ LOAD TEAM FILES (still mock)
      // -------------------------
      const fileResult = await getTeamFiles(teamName);
      setFiles(fileResult.success ? fileResult.files : []);
    };

    loadData();
  }, [teamName]);

  return (
    <>
      <UserNavbar />

      <div className="min-h-screen bg-[#111418] p-10 text-white">

        {/* PAGE HEADER */}
        <h1 className="text-3xl font-bold mb-8">
          Team: <span className="text-blue-400">{teamName}</span>
        </h1>

        {/* GRID: LEFT → Uploader | RIGHT → Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* LEFT: FILE UPLOADER */}
          <div className="bg-[#1a1d21] border border-[#2a2f35] rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
            <FileUploader teamName={teamName} />
          </div>

          {/* RIGHT: KEY + FILE LIST */}
          <div className="space-y-8">

            {/* PUBLIC KEY */}
            <div className="bg-[#1a1d21] border border-[#2a2f35] rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Team Public Key</h2>

              {loadingKey ? (
                <p className="text-gray-400">Loading public key...</p>
              ) : (
                <pre className="bg-[#0f1214] p-4 rounded-xl text-sm whitespace-pre-wrap border border-gray-800">
                  {publicKey}
                </pre>
              )}
            </div>

            {/* FILE LIST */}
            <div className="bg-[#1a1d21] border border-[#2a2f35] rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Team Folder Files</h2>

              {files.length === 0 ? (
                <p className="text-gray-400">No files found.</p>
              ) : (
                <ul className="space-y-3">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="flex justify-between p-3 bg-[#0f1214] rounded-lg border border-gray-800"
                    >
                      <span>{file}</span>
                      <button className="text-blue-400 hover:underline">
                        Download
                      </button>
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
