import React from "react";

export function Label({ htmlFor, children, className = "" }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block mb-1 text-sm font-medium text-gray-700 ${className}`}
    >
      {children}
    </label>
  );
}
