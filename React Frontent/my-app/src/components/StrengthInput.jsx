"use client";

import { useId, useMemo, useState } from "react";
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StrengthInput({
  label = "Input",
  value,
  setValue,
  type = "password", // "password" or "username"
  passwordToCompare = "", // used to ensure username != password
}) {
  const id = useId();
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible((v) => !v);

  // ================================
  // RULES FOR USERNAME + PASSWORD
  // ================================
  const rules = {
    username: [
      { regex: /.{8,}/, text: "At least 8 characters" },
      { regex: /^[^\s]+$/, text: "No spaces allowed" },
      { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
      { regex: /[0-9]/, text: "At least 1 number" },
    ],
    password: [
      { regex: /.{8,}/, text: "At least 8 characters" },
      { regex: /[0-9]/, text: "At least 1 number" },
      { regex: /[a-z]/, text: "At least 1 lowercase letter" },
      { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
    ],
  };

  const selectedRules = rules[type];

  const checkStrength = (input) =>
    selectedRules.map((req) => ({
      met: req.regex.test(input),
      text: req.text,
    }));

  const strength = checkStrength(value);

  const strengthScore = useMemo(() => {
    return strength.filter((req) => req.met).length;
  }, [strength]);

  const getStrengthColor = (score) => {
    if (score === 0) return "bg-border";
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-orange-500";
    if (score === 3) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStrengthText = (score) => {
    if (score === 0) return `Enter a ${label.toLowerCase()}`;
    if (score <= 2) return "Weak";
    if (score === 3) return "Medium";
    return "Strong";
  };

  const usernamePasswordSame =
    type === "password" && value && value === passwordToCompare;

  return (
    <div className="*:not-first:mt-2 w-full">
      <Label htmlFor={id}>{label}</Label>

      {/* Input Box */}
      <div className="relative">
        <Input
          id={id}
          className="pe-9"
          placeholder={label}
          type={type === "password" ? (isVisible ? "text" : "password") : "text"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        {/* Show/Hide password toggle */}
        {type === "password" && (
          <button
            className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center text-muted-foreground/80 hover:text-foreground"
            type="button"
            onClick={toggleVisibility}
          >
            {isVisible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </button>
        )}
      </div>

      {/* Strength Bar */}
      <div className="mt-3 mb-4 h-1 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full ${getStrengthColor(
            strengthScore
          )} transition-all duration-500`}
          style={{ width: `${(strengthScore / selectedRules.length) * 100}%` }}
        />
      </div>

      {/* Strength text */}
      <p className="text-sm font-medium mb-2">
        {getStrengthText(strengthScore)}. Must contain:
      </p>

      {/* Rules List */}
      <ul className="space-y-1.5">
        {strength.map((req, index) => (
          <li key={index} className="flex items-center gap-2">
            {req.met ? (
              <CheckIcon size={16} className="text-emerald-500" />
            ) : (
              <XIcon size={16} className="text-muted-foreground/80" />
            )}
            <span
              className={`text-xs ${
                req.met ? "text-emerald-600" : "text-muted-foreground"
              }`}
            >
              {req.text}
            </span>
          </li>
        ))}
      </ul>

      {/* Username = Password ERROR */}
      {usernamePasswordSame && (
        <p className="text-red-400 text-xs mt-2">
          ❌ Password cannot be the same as username.
        </p>
      )}
    </div>
  );
}
