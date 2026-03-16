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
  const hasDrawer = !!drawer;

  return (
    <main className="flex h-screen overflow-hidden">
      <div
        className={cn(
          "shrink-0 flex flex-col overflow-hidden transition-[flex-basis] duration-300 ease-in-out",
          hasDrawer && drawerOpen ? "basis-2/5" : "basis-full",
        )}
      >
        <header className="shrink-0 bg-gray-100 h-[10vh] px-[4vw]">
          {header}
        </header>

        <section className="flex-1 min-h-0 overflow-auto bg-white-100 px-[4vw] py-[2vh]">
          <div className="mx-auto flex w-full max-w-[94vw] flex-col">
            {children}
          </div>
        </section>
      </div>

      {hasDrawer && (
        <aside
          className={cn(
            "shrink-0 overflow-hidden transition-[flex-basis] duration-300 ease-in-out shadow-xl shadow-black/25 px-[4vw] py-[3vh]",
            drawerOpen ? "basis-3/5" : "basis-0",
          )}
        >
          {/* Nested div to a fixed width to avoid animation issues */}
          <div className="h-full w-[60vw]">{drawer}</div>
        </aside>
      )}
    </main>
  );
}
