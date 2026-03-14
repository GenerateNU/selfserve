import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-green-900 text-white hover:bg-green-950",
  secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
};

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`px-[0.75vw] py-[0.4vh] w-[10vw] h-[4vh] text-sm rounded-sm ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
}
