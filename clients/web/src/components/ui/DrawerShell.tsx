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
    <aside className="flex h-full w-full flex-col">
      <header className="flex flex-col pl-5 pr-6 pt-5 pb-4">
        <button
          type="button"
          onClick={onClose}
          className="self-start rounded p-1 hover:bg-bg-selected"
        >
          <X className="size-5" />
        </button>
        <div className="mt-2 px-5">{title}</div>
      </header>
      <div
        className={cn(
          "flex flex-col gap-4 overflow-y-auto px-10 py-2",
          className,
        )}
      >
        {children}
      </div>
    </aside>
  );
}
