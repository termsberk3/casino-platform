import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type AlertVariant = "error" | "warning" | "success" | "info";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

export function Alert({ className, variant = "info", ...props }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        variant === "error" && "border-red-900 bg-red-950 text-red-200",
        variant === "warning" && "border-amber-900 bg-amber-950 text-amber-100",
        variant === "success" &&
          "border-emerald-900 bg-emerald-950 text-emerald-100",
        variant === "info" && "border-zinc-800 bg-zinc-900 text-zinc-300",
        className,
      )}
      {...props}
    />
  );
}
