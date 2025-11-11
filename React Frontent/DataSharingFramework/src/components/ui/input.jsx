import React from "react";

export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`border border-gray-300 rounded-md px-3 py-2 w-full outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-300 ${className}`}
    />
  );
}
