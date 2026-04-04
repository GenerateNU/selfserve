import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DrawerShellProps = {
  title: string;
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
      <header className="flex items-center justify-between px-8 py-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <button type="button" onClick={onClose} className="p-2">
          <X />
        </button>
      </header>
      <div
        className={cn(
          "flex flex-col gap-4 overflow-y-auto px-8 py-2",
          className,
        )}
      >
        {children}
      </div>
    </aside>
  );
}
