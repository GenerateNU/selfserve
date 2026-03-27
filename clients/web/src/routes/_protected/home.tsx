import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { Request } from "@shared";
import { GlobalTaskInput } from "@/components/ui/GlobalTaskInput";
import { PageShell } from "@/components/ui/PageShell";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeToolbar } from "@/components/home/HomeToolbar";
import { HomeFilterBar } from "@/components/home/HomeFilterBar";
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

  return (
    <PageShell
      header={
        <>
          <HomeHeader />
          <HomeToolbar className="mt-2" />
          <HomeFilterBar />
        </>
      }
      drawerOpen={generatedRequest !== null}
      drawer={
        <GeneratedRequestDrawer
          request={generatedRequest}
          onClose={() => setGeneratedRequest(null)}
        />
      }
      contentClassName="!px-0 h-full overflow-hidden relative"
    >
      <div className="absolute inset-0 flex items-stretch gap-6 overflow-x-auto overflow-y-hidden p-6 pb-0">
        {PLACEHOLDER_COLUMNS.map((col) => (
          <KanbanColumn key={col.title} title={col.title}>
            {col.tasks.map((task, i) => (
              <RequestCardItem key={i} {...task} />
            ))}
          </KanbanColumn>
        ))}
      </div>
      {generatedRequest === null && (
        <GlobalTaskInput onRequestGenerated={setGeneratedRequest} />
      )}
    </PageShell>
  );
}
