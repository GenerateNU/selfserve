import { FlagIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { cn } from "@/lib/utils";

type TagPriority = "high" | "medium";

type TagIcon = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;

type TagProps = {
  label?: string;
  icon?: TagIcon;
  iconClassName?: string;
  labelClassName?: string;
  priority?: TagPriority;
  className?: string;
};

type PriorityTagConfig = {
  label: string;
  Icon: LucideIcon;
  containerClass: string;
  contentClass: string;
};

const priorityTagConfig: Record<TagPriority, PriorityTagConfig> = {
  high: {
    label: "High Priority",
    Icon: FlagIcon,
    containerClass: "bg-bg-high-priority",
    contentClass: "text-high-priority",
  },
  medium: {
    label: "Medium Priority",
    Icon: FlagIcon,
    containerClass: "bg-bg-orange",
    contentClass: "text-text-orange",
  },
};

export function Tag({
  label,
  icon: Icon,
  iconClassName = "",
  labelClassName = "",
  priority,
  className = "",
}: TagProps) {
  if (priority) {
    const config = priorityTagConfig[priority];
    const {
      label: priorityLabel,
      Icon: PriorityIcon,
      containerClass,
      contentClass,
    } = config;

    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 rounded px-2 py-1",
          containerClass,
          className,
        )}
      >
        <PriorityIcon className={cn("size-4", contentClass)} strokeWidth={2} />
        <span className={cn("text-xs", contentClass)}>{priorityLabel}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded border px-2 py-1",
        className,
      )}
    >
      {Icon ? (
        <Icon
          className={cn("size-3 shrink-0", iconClassName)}
          strokeWidth={1.5}
        />
      ) : null}
      {label ? (
        <span className={cn("text-xs", labelClassName)}>{label}</span>
      ) : null}
    </div>
  );
}
