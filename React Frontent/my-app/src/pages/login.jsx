// src/pages/login.jsx
"use client";

import { useId, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import DecryptedText from "@/components/DecryptedText";

import { loginUser, generateToken, verifyToken } from "@/auth";

import { useNavigate } from "react-router-dom";

import "./login.css";

export default function LoginPage() {
  const usernameId = useId();
  const passwordId = useId();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const navigate = useNavigate();
  const toggleVisibility = () => setIsVisible((prev) => !prev);

  // ===================================================
  // 🔥 HANDLE LOGIN
  // ===================================================
  const handleLogin = async () => {
    setMessage("");
    setMessageType("");

    if (!username.trim() || !password.trim()) {
      setMessage("Please enter both username and password.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    // 1️⃣ LOGIN USER
    const loginResult = await loginUser(username.trim(), password.trim());
    if (!loginResult.success) {
      setMessage(loginResult.message || "Login failed!");
      setMessageType("error");
      setLoading(false);
      return;
    }

    const { name, role, username: actualUsername } = loginResult;
    setMessage(`Welcome ${name} (${role})`);
    setMessageType("success");

    // 2️⃣ GENERATE JWT
    const tokenResult = await generateToken(actualUsername, role);
    if (!tokenResult.success) {
      setMessage("Failed to generate token.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    // 3️⃣ VERIFY JWT
    const verifyResult = await verifyToken();
    if (!verifyResult.success) {
      setMessage("Token verification failed. Please try again.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    const decodedRole = verifyResult.decoded.role;
    setMessage("Login successful! Redirecting...");
    setMessageType("success");

    // 4️⃣ STORE FRESH TOKEN + REDIRECT
    setTimeout(() => {
      if (["manager", "admin"].includes(decodedRole.toLowerCase())) {

        // Store NEW token — not old one!
        localStorage.setItem("managerToken", tokenResult.token);

        navigate("/manager");
      } else {
        localStorage.setItem("userToken", tokenResult.token);
        localStorage.setItem("username", actualUsername);

        navigate("/user");
      }
    }, 2000);

    setLoading(false);
  };

  // ===================================================
  // 🔥 UI
  // ===================================================
  return (
    <div className="login-container">

      <div className="login-heading">
        <DecryptedText
          text="Encrypted Data Sharing Framework"
          speed={40}
          maxIterations={20}
          sequential={true}
          animateOn="view"
          revealDirection="start"
          characters="0c71d3a9d2c67376386e7ca9b4cf4a11"
          parentClassName="decrypt-parent"
          encryptedClassName="decrypt-encrypted"
          className="decrypt-revealed"
        />
      </div>

      <div className="login-box">

        {/* USERNAME */}
        <div className="input-wrapper">
          <Label htmlFor={usernameId}>Username</Label>
          <Input
            id={usernameId}
            placeholder="Enter username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className="input-wrapper" style={{ marginTop: "20px" }}>
          <Label htmlFor={passwordId}>Password</Label>
          <div className="relative">
            <Input
              id={passwordId}
              className="pe-9"
              placeholder="Enter password"
              type={isVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 hover:text-foreground"
              type="button"
              onClick={toggleVisibility}
            >
              {isVisible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
        </div>

        {/* BUTTON */}
        <div className="mt-5 flex flex-col items-center">
          <Button className="login-button" onClick={handleLogin} disabled={loading}>
            {loading ? "Processing..." : "Login"}
          </Button>

          {message && (
            <p
              className={`mt-4 text-sm ${
                messageType === "error" ? "text-red-400" : "text-green-400"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
