// src/pages/manager.jsx
"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagerNavbar from "@/components/managerNavbar";
import { getTeams } from "@/managerAPI";
import { checkManager } from "@/validation/checkManager";
import "./manager.css";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ManagerPage() {
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();

  // ============================================
  // 🔐 Token Validation
  // ============================================
  useEffect(() => {
    let intervalId;

    async function validateToken() {
      await checkManager();
    }

    validateToken(); // run immediately
    intervalId = setInterval(validateToken, 15000);

    return () => clearInterval(intervalId);
  }, []);

  // ============================================
  // Load teams once
  // ============================================
  useEffect(() => {
    async function loadTeams() {
      const result = await getTeams();
      if (result.success) {
        setTeams(result.teams);
      }
    }
    loadTeams();
  }, []);

  const handleRowClick = (team) => {
    navigate(`/manager/manageTeam/${encodeURIComponent(team.teamName)}`);
  };

  return (
    <>
      <ManagerNavbar />

      <div className="min-h-screen bg-[#111418] p-6">
        <h1 className="text-3xl font-bold mb-6 text-white">Manage Teams</h1>

        <div className="bg-[#1a1d21] p-4 rounded-lg">
          <Table className="text-gray-200">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-gray-300">Sr No.</TableHead>
                <TableHead className="text-gray-300">Team Name</TableHead>
                <TableHead className="text-gray-300">Project Name</TableHead>
                <TableHead className="text-right text-gray-300">Members</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {teams.map((team, index) => (
                <TableRow
                  key={index}
                  onClick={() => handleRowClick(team)}
                  className="cursor-pointer hover:bg-[#2a2f35] transition-colors duration-200"
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{team.teamName}</TableCell>
                  <TableCell>{team.projectName}</TableCell>
                  <TableCell className="text-right">
                    {team.memberCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

            <TableFooter className="bg-transparent">
              <TableRow>
                <TableCell colSpan={3}>Total Teams</TableCell>
                <TableCell className="text-right">{teams.length}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </>
  );
}
