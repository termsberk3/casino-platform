import { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-yellow-400 text-red-950 shadow-lg shadow-yellow-950/30 hover:bg-amber-300 hover:shadow-yellow-700/30",
  secondary:
    "border border-yellow-700/30 bg-zinc-950 text-yellow-100 hover:border-yellow-500/60 hover:bg-yellow-400/10 hover:text-yellow-200",
  danger:
    "bg-red-700 text-white shadow-lg shadow-red-950/30 hover:bg-red-600",
  ghost:
    "text-zinc-300 hover:bg-zinc-800 hover:text-yellow-200",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}