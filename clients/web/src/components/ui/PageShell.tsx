import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = {
  header: ReactNode;
  drawer?: ReactNode;
  drawerOpen?: boolean;
  children: ReactNode;
  contentClassName?: string;
};

export function PageShell({
  header,
  drawer,
  drawerOpen = false,
  children,
  contentClassName,
}: PageShellProps) {
  const hasDrawer = drawer !== undefined;

  return (
    <main className="relative flex h-screen w-full min-w-0 overflow-hidden">
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <header className="shrink-0 bg-bg-container">{header}</header>

        <section className="flex-1 min-h-0 overflow-auto bg-bg-primary">
          <div className={cn("flex flex-col mx-auto w-full px-16", contentClassName)}>{children}</div>
        </section>
      </div>

      {hasDrawer && (
        <aside
          className={cn(
            "absolute right-0 top-0 h-full overflow-hidden bg-white shadow-xl shadow-black/25 transition-[width] duration-300 ease-in-out",
            drawerOpen ? "w-[45vw]" : "w-0",
          )}
        >
          <div className="h-full w-[45vw]">{drawer}</div>
        </aside>
      )}
    </main>
  );
}
