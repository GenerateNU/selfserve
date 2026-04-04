import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { Request, RequestPriority } from "@shared";
import { GlobalTaskInput } from "@/components/ui/GlobalTaskInput";
import { PageShell } from "@/components/ui/PageShell";
import { HomeToolbar } from "@/components/home/HomeToolbar";
import { HomeFilterBar } from "@/components/home/HomeFilterBar";
import { CreateRequestDrawer } from "@/components/home/CreateRequestDrawer";
import { KanbanColumn } from "@/components/requests/KanbanColumn";
import { RequestCardItem } from "@/components/requests/RequestCardItem";
import { PLACEHOLDER_COLUMNS } from "@/mock-data/home";

export const Route = createFileRoute("/_protected/home")({
  component: HomePage,
});

function HomePage() {
  const [drawerData, setDrawerData] = useState<{
    name?: string;
    description?: string;
    priority?: RequestPriority;
  } | null>(null);

  function handleCreateRequest() {
    setDrawerData({});
  }

  function handleRequestGenerated(request: Request) {
    setDrawerData({
      name: request.name,
      description: request.description,
      priority: request.priority,
    });
  }

  const drawer =
    drawerData !== null ? (
      <CreateRequestDrawer
        initialData={drawerData}
        onClose={() => setDrawerData(null)}
      />
    ) : null;

  return (
    <PageShell
      header={{
        title: "Home",
        description: "Overview of all tasks currently at play",
      }}
      drawerOpen={drawerData !== null}
      drawer={drawer}
      contentClassName="!px-0 h-full overflow-hidden relative"
    >
      <HomeToolbar className="mt-2" onCreateRequest={handleCreateRequest} />
      <HomeFilterBar />
      <div className="relative flex-1 min-h-0">
        <div className="absolute inset-0 flex items-stretch gap-6 overflow-x-auto overflow-y-hidden p-6 pb-0">
          {PLACEHOLDER_COLUMNS.map((col) => (
            <KanbanColumn key={col.title} title={col.title}>
              {col.tasks.map((task, i) => (
                <RequestCardItem key={i} {...task} />
              ))}
            </KanbanColumn>
          ))}
        </div>
      </div>
      {drawerData === null && (
        <GlobalTaskInput onRequestGenerated={handleRequestGenerated} />
      )}
    </PageShell>
  );
}
