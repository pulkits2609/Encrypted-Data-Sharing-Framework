// src/pages/user.jsx
"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import UserNavbar from "@/components/userNavbar";
import { getMyTeams } from "@/userAPI";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UserDashboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  useEffect(() => {
    const loadTeams = async () => {
      if (!username) {
        console.error("Username not found in localStorage!");
        setLoading(false);
        return;
      }

      const result = await getMyTeams(username);

      if (result.success) {
        setTeams(result.teams);
      } else {
        alert("Failed to fetch your teams.");
      }

      setLoading(false);
    };

    loadTeams();
  }, [username]);

  return (
    <>
      <UserNavbar />

      <div className="min-h-screen bg-[#111418] text-white p-10">
        <h1 className="text-3xl font-bold mb-6">Your Teams</h1>

        {loading ? (
          <p className="text-gray-400">Loading your teams...</p>
        ) : teams.length === 0 ? (
          <p className="text-gray-400">You are not added to any team yet.</p>
        ) : (
          <div className="rounded-xl bg-[#1a1d21] border border-[#2a2f35] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Members</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {teams.map((team, index) => (
                  <TableRow
                    key={index}
                    className="hover:bg-[#22272d] cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/user/team/${encodeURIComponent(team.teamName)}`
                      )
                    }
                  >
                    <TableCell>{team.teamName}</TableCell>
                    <TableCell>{team.projectName}</TableCell>
                    <TableCell>{team.members.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
