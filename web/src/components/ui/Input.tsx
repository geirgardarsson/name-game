import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  inputRef?: React.Ref<HTMLInputElement>;
};

export function Input({ inputRef, ...props }: InputProps) {
  return (
    <input
      ref={inputRef}
      {...props}
      className={`w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md focus:border-transparent ${
        props.className ?? ""
      }`}
    />
  );
}
