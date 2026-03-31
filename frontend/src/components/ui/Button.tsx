import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "./cn";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "border-black bg-black text-white hover:bg-charcoal",
  secondary: "border-gray-300 bg-white text-black hover:border-black hover:bg-gray-50",
  danger: "border-red-200 bg-red-50 text-red-800 hover:border-red-300 hover:bg-red-100",
  ghost: "border-transparent bg-transparent text-black hover:border-gray-300 hover:bg-gray-100",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, type = "button", variant = "primary", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex h-10 items-center justify-center border px-4 text-sm font-medium font-sans transition-colors duration-200 rounded-none",
        "focus:outline-none focus:ring-1 focus:ring-black focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  );
});