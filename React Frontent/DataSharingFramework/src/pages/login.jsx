import React from "react";
import "./login.css";
import UsernameInput from "../components/input";
import PasswordInput from "../components/password";
import DotGrid from "../components/dotgrid.jsx"

function Login() {
  return (
    <>
    <DotGrid />
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>

        {/* Username input (custom component) */}
        <UsernameInput />

        {/* Password input (your existing custom component) */}
        <PasswordInput />

        <button className="login-button">Login</button>
      </div>
    </div>
    </>
  );
}

export default Login;
