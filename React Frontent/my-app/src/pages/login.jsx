import { useId, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import DecryptedText from "@/components/DecryptedText";

import { loginUser, generateToken, verifyToken, getToken } from "@/auth";

import { useNavigate } from "react-router-dom";

import "./login.css";

export default function LoginPage() {
  const usernameId = useId();
  const passwordId = useId();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const toggleVisibility = () => setIsVisible((prev) => !prev);

  // ==========================
  // 🔥 Handle Full Login Flow
  // ==========================
  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    setLoading(true);

    // 1️⃣ LOGIN USER
    const loginResult = await loginUser(username, password);

    if (!loginResult.success) {
      alert(loginResult.message || "Login failed!");
      setLoading(false);
      return;
    }

    const { name, role, username: actualUsername } = loginResult;

    alert(`Login Successful! Welcome ${name} (${role})`);

    // 2️⃣ GENERATE JWT
    const tokenResult = await generateToken(actualUsername, role);

    if (!tokenResult.success) {
      alert("Failed to generate token.");
      setLoading(false);
      return;
    }

    // 3️⃣ VERIFY JWT
    const verifyResult = await verifyToken();

    if (!verifyResult.success) {
      alert("Token verification failed: " + (verifyResult.error || verifyResult.message));
      setLoading(false);
      return;
    }

    const decodedRole = verifyResult.decoded.role;
    alert("Token verified successfully!");

    // 4️⃣ STORE TOKEN + ROUTE
    if (decodedRole.toLowerCase() === "manager" || decodedRole.toLowerCase() === "admin") {
      localStorage.setItem("managerToken", getToken());
      navigate("/manager");
    } else {
      localStorage.setItem("userToken", getToken());
      localStorage.setItem("username", actualUsername);
      navigate("/user");
    }

    setLoading(false);
  };

  return (
    <div className="login-container">

      {/* Heading */}
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

      {/* LOGIN BOX */}
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
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground"
              type="button"
              onClick={toggleVisibility}
              aria-label={isVisible ? "Hide password" : "Show password"}
              aria-pressed={isVisible}
            >
              {isVisible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
        </div>

        {/* BUTTON */}
        <div className="mt-5 flex justify-center">
          <Button className="login-button" onClick={handleLogin} disabled={loading}>
            {loading ? "Processing..." : "Login"}
          </Button>
        </div>

      </div>
    </div>
  );
}
