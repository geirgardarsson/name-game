import React from "react";

interface ToastProps {
  message: string;
  color?: string;
}

export function Toast({ message }: ToastProps) {
  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow-lg bg-red-500 text-white z-50 text-sm`}
      style={{ minWidth: 200, maxWidth: 320 }}
    >
      {message}
    </div>
  );
}
