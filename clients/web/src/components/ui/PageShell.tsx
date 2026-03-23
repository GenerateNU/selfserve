import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = {
  header: ReactNode;
  drawer?: ReactNode;
  drawerOpen?: boolean;
  children: ReactNode;
};

export function PageShell({
  header,
  drawer,
  drawerOpen = false,
  children,
}: PageShellProps) {
  const hasDrawer = drawer !== undefined;

  return (
    <main className="flex h-screen w-full min-w-0 overflow-hidden">
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <header className="shrink-0 bg-gray-100">{header}</header>

        <section className="flex-1 min-h-0 overflow-auto bg-bg-primary">
          <div className="flex flex-col mx-auto w-full px-16">{children}</div>
        </section>
      </div>

      {hasDrawer && (
        <aside
          className={cn(
            "relative min-w-0 shrink-0 overflow-hidden shadow-xl shadow-black/25 transition-[flex-basis] duration-300 ease-in-out",
            drawerOpen ? "basis-[45vw]" : "basis-0",
          )}
        >
          <div className="h-full w-[45vw]">{drawer}</div>
        </aside>
      )}
    </main>
  );
}
