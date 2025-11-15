"use client";

import { useNavigate } from "react-router-dom";

export default function UserNavbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("managerToken");
    navigate("/");
  };

  return (
    <nav className="w-full bg-[#1a1d21] border-b border-[#2a2f35] p-4 flex justify-between items-center text-white">

      {/* Left side — Dashboard */}
      <h1 className="text-xl font-semibold tracking-wide">
        User Dashboard
      </h1>

      {/* Right side — Logout */}
      <button
        onClick={logout}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium"
      >
        Logout
      </button>

    </nav>
  );
}
