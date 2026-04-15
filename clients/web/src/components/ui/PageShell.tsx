import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = {
  header?: {
    title: string;
    description: string;
  };
  headerBorder?: boolean;
  drawer?: ReactNode;
  drawerOpen?: boolean;
  children: ReactNode;
  contentClassName?: string;
  bodyClassName?: string;
};

export function PageShell({
  header,
  headerBorder = true,
  drawer,
  drawerOpen = false,
  children,
  contentClassName,
  bodyClassName,
}: PageShellProps) {
  const hasDrawer = drawer !== undefined;

  return (
    <main className="relative flex h-screen w-full min-w-0 overflow-hidden">
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {header ? (
          <header
            className={cn(
              "shrink-0 bg-white px-6 pt-4 pb-3 flex flex-col gap-1.5",
              headerBorder && "border-b border-stroke-subtle",
            )}
          >
            <h1 className="text-2xl font-bold tracking-tight text-text-default">
              {header.title}
            </h1>
            <h2 className="text-sm text-text-subtle">{header.description}</h2>
          </header>
        ) : null}

        <section
          className={cn(
            "flex-1 min-h-0 overflow-auto bg-neutral-10 px-6 py-4",
            bodyClassName,
          )}
        >
          <div className={cn("flex flex-col mx-auto w-full", contentClassName)}>
            {children}
          </div>
        </section>
      </div>

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
