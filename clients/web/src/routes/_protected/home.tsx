import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { Request } from "@shared";
import { GlobalTaskInput } from "@/components/ui/GlobalTaskInput";
import { PageShell } from "@/components/ui/PageShell";
import { HomeToolbar } from "@/components/home/HomeToolbar";
import { HomeFilterBar } from "@/components/home/HomeFilterBar";
import { CreateRequestDrawer } from "@/components/home/CreateRequestDrawer";
import { KanbanColumn } from "@/components/requests/KanbanColumn";
import { RequestCardItem } from "@/components/requests/RequestCardItem";
import { PLACEHOLDER_COLUMNS } from "@/mock-data/home";
import { GeneratedRequestDrawer } from "@/components/requests/GeneratedRequestDrawer";

export const Route = createFileRoute("/_protected/home")({
  component: HomePage,
});

function HomePage() {
  const [generatedRequest, setGeneratedRequest] = useState<Request | null>(
    null,
  );
  const [createRequestOpen, setCreateTaskOpen] = useState(false);

  const drawerOpen = createRequestOpen || generatedRequest !== null;

  function handleCreateRequest() {
    setGeneratedRequest(null);
    setCreateTaskOpen(true);
  }

  function handleRequestGenerated(request: Request) {
    setCreateTaskOpen(false);
    setGeneratedRequest(request);
  }

  const drawer = createRequestOpen ? (
    <CreateRequestDrawer onClose={() => setCreateTaskOpen(false)} />
  ) : (
    <GeneratedRequestDrawer
      request={generatedRequest}
      onClose={() => setGeneratedRequest(null)}
    />
  );

  return (
    <PageShell
      header={{
        title: "Home",
        description: "Overview of all tasks currently at play",
      }}
      drawerOpen={drawerOpen}
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
      {!createRequestOpen && generatedRequest === null && (
        <GlobalTaskInput onRequestGenerated={handleRequestGenerated} />
      )}
    </PageShell>
  );
}
