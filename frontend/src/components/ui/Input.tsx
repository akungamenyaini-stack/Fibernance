import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "./cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = "text", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-10 w-full border border-gray-300 bg-white px-3 text-sm text-black font-sans placeholder:text-gray-500 rounded-none transition-colors duration-200",
        "focus:border-black focus:outline-none focus:ring-1 focus:ring-black",
        "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500",
        className,
      )}
      {...props}
    />
  );
});