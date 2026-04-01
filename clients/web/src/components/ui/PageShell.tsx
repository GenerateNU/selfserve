import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = {
  header: ReactNode;
  drawer?: ReactNode;
  drawerOpen?: boolean;
  onDrawerClose?: () => void;
  children: ReactNode;
  contentClassName?: string;
  bodyClassName?: string;
};

export function PageShell({
  header,
  drawer,
  drawerOpen = false,
  onDrawerClose,
  children,
  contentClassName,
  bodyClassName,
}: PageShellProps) {
  const hasDrawer = drawer !== undefined;
  const showOverlay = hasDrawer && drawerOpen && onDrawerClose !== undefined;

  return (
    <main className="relative flex h-screen w-full min-w-0 overflow-hidden">
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <header className="shrink-0 bg-bg-container">{header}</header>

        <section
          className={cn(
            "flex-1 min-h-0 overflow-auto bg-bg-primary",
            bodyClassName,
          )}
        >
          <div
            className={cn(
              "flex flex-col mx-auto w-full px-16",
              contentClassName,
            )}
          >
            {children}
          </div>
        </section>
      </div>

      {showOverlay && (
        <button
          type="button"
          aria-label="Close drawer overlay"
          className="absolute inset-0 z-40 bg-transparent"
          onClick={onDrawerClose}
        />
      )}

      {hasDrawer && (
        <aside
          className={cn(
            "fixed inset-y-0 right-0 z-50 h-full w-153 overflow-hidden bg-white shadow-xl shadow-black/25 transition-transform duration-300 ease-in-out",
            drawerOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="h-full w-full">{drawer}</div>
        </aside>
      )}
    </main>
  );
}
