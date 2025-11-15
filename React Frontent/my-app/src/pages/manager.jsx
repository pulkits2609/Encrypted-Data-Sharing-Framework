"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import ManagerNavbar from "@/components/managerNavbar"
import { getTeams } from "../managerAPI"
import "./manager.css"

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function ManagerPage() {
  const [teams, setTeams] = useState([])
  const navigate = useNavigate()                 

  useEffect(() => {
    async function loadTeams() {
      const result = await getTeams()
      if (result.success) {
        setTeams(result.teams)
      }
    }
    loadTeams()
  }, [])

  // 🟦 Row click → navigate to ManageTeam page
  const handleRowClick = (team) => {
    navigate(`/manager/manageTeam/${encodeURIComponent(team.teamName)}`)
  }

  return (
    <>
      <ManagerNavbar />

      {/* DARK BACKGROUND FIX */}
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
                  <TableCell className="text-gray-200">{index + 1}</TableCell>
                  <TableCell className="text-gray-200">{team.teamName}</TableCell>
                  <TableCell className="text-gray-200">{team.projectName}</TableCell>
                  <TableCell className="text-right text-gray-200">
                    {team.memberCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

            <TableFooter className="bg-transparent">
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3} className="text-gray-300">
                  Total Teams
                </TableCell>
                <TableCell className="text-right text-gray-300">
                  {teams.length}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

      </div>
    </>
  )
}
