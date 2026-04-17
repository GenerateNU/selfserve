import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "bg-bg-container text-text-default hover:bg-bg-selected",
};

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "px-6 py-2.5 w-33 h-10 text-sm rounded-sm disabled:opacity-50 disabled:pointer-events-none",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
