import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "./cn";

type BadgeVariant = "success" | "warning" | "error" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const badgeVariants: Record<BadgeVariant, string> = {
  success: "bg-green-50 border-green-200 text-green-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  error: "bg-red-50 border-red-200 text-red-800",
  neutral: "bg-gray-100 border-gray-300 text-gray-700",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant = "neutral", ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center border px-2.5 py-1 text-[11px] font-semibold font-sans uppercase tracking-[0.18em] rounded-none",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
});