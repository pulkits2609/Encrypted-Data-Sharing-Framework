import { useId, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function PasswordInput() {
  const id = useId();
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible((prev) => !prev);

  return (
    <div className="password-wrapper">
      <label htmlFor={id} className="password-label">
        Password
      </label>
      <div className="password-input-container">
        <input
          id={id}
          className="password-input pe-9"
          placeholder="Enter password"
          type={isVisible ? "text" : "password"}
        />
        <button
          className="password-toggle"
          type="button"
          onClick={toggleVisibility}
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
        >
          {isVisible ? (
            <EyeOffIcon size={16} aria-hidden="true" />
          ) : (
            <EyeIcon size={16} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
