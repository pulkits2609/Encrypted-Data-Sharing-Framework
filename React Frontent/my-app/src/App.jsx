// App.jsx
import { Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Manager from "./pages/manager";
import User from "./pages/user";
import ManageTeam from "./pages/manageTeam";
import CreateNewUser from "./pages/createNewUser";
import CreateNewTeam from "./pages/createNewTeam";
import UserTeam from "./pages/userTeam";

export default function App() {
  return (
    <Routes>
      {/* Default route → Login */}
      <Route path="/" element={<Login />} />

      {/* Manager Dashboard */}
      <Route path="/manager" element={<Manager />} />

      {/* Manager Creates new Users */}
      <Route path="/manager/createNew" element={<CreateNewUser />} />

      {/* Manager Creates new Team */}
      <Route path="/manager/newTeam" element={<CreateNewTeam />} />

      {/* Team Specific Page (Manager) */}
      <Route path="/manager/manageTeam/:teamName" element={<ManageTeam />} />

      {/* User Dashboard */}
      <Route path="/user" element={<User />} />

      {/* User → Team Page */}
      <Route path="/user/team/:teamName" element={<UserTeam />} />
    </Routes>
  );
}
