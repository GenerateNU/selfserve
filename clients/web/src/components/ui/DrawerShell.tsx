import { X } from "lucide-react";
import type { ReactNode } from "react";

type DrawerShellProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function DrawerShell({ title, onClose, children }: DrawerShellProps) {
  return (
    <aside className="flex h-full w-full flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <button type="button" onClick={onClose} className="p-2">
          <X />
        </button>
      </header>
      <div className="flex flex-col gap-4 overflow-y-auto px-6 py-2">
        {children}
      </div>
    </aside>
  );
}
