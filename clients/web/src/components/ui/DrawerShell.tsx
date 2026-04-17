import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DrawerShellProps = {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export function DrawerShell({
  title,
  onClose,
  children,
  className,
}: DrawerShellProps) {
  return (
    <div className="h-full w-full">
      <div className="w-full px-6 pt-5 pb-4">
        <div className="w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-start p-0 hover:bg-bg-selected"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-2 block w-full text-left">{title}</div>
      </div>

      <div
        className={cn(
          "flex flex-col gap-4 overflow-y-auto px-10 py-2",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
