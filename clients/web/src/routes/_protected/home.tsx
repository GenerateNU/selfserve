import { createFileRoute } from "@tanstack/react-router";
import { GlobalTaskInput } from "@/components/ui/GlobalTaskInput";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeToolbar } from "@/components/home/HomeToolbar";
import { HomeFilterBar } from "@/components/home/HomeFilterBar";
import { KanbanColumn } from "@/components/requests/KanbanColumn";
import { RequestCardItem } from "@/components/requests/RequestCardItem";
import { PLACEHOLDER_COLUMNS } from "@/mock-data/home";

export const Route = createFileRoute("/_protected/home")({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="flex flex-col h-screen w-[calc(100vw-16rem)] overflow-hidden">
      <HomeHeader />
      <HomeToolbar className="mt-2" />
      <HomeFilterBar />
      <div className="relative flex-1 overflow-hidden">
        <div className="flex items-stretch gap-6 h-full overflow-x-auto overflow-y-hidden p-6 pb-0">
          {PLACEHOLDER_COLUMNS.map((col) => (
            <KanbanColumn key={col.title} title={col.title}>
              {col.tasks.map((task, i) => (
                <RequestCardItem key={i} {...task} />
              ))}
            </KanbanColumn>
          ))}
        </div>
      </div>
      <GlobalTaskInput />
    </main>
  );
}
