import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type TagProps = {
  label: string;
  icon?: LucideIcon;
  variant?: "default" | "danger";
};

type TagVariant = "default" | "danger";

const variantStyles: Record<TagVariant, { text: string; stroke: string }> = {
  default: {
    text: "text-text-secondary",
    stroke: "border-stroke-default",
  },
  danger: {
    text: "text-danger",
    stroke: "border-danger-stroke",
  },
};

export function Tag({ label, icon: Icon, variant = "default" }: TagProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "rounded-lg border pl-3 pr-4 py-1.5 inline-flex items-center gap-1",
        styles.text,
        styles.stroke,
      )}
    >
      {Icon ? <Icon className="h-5 w-5 shrink-0" strokeWidth={2.5} /> : null}
      <span className="text-sm">{label}</span>
    </div>
  );
}
