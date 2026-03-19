import { createFileRoute } from "@tanstack/react-router";
import type { RequestStatus } from "@/components/requests/RequestCard";
import { RequestCardItem } from "@/components/requests/RequestCardItem";
import { LayoutGrid, ArrowDownUp, Search, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

function HomeHeader() {
  return (
    <header className="px-6 py-5 flex-row gap-1.5 border-b border-stroke-subtle">
      <h1 className="text-2xl font-semibold text-text-default">Home</h1>
      <h2 className="text-sm font-medium text-text-subtle">Overview of all tasks currently at play</h2>
    </header>
  );
}

export const Route = createFileRoute("/_protected/home")({
  component: HomePage,
});

const PLACEHOLDER_TASK_CONTENT: Array<{
  status: RequestStatus;
  time: string;
  title: string;
  assignees: Array<string>;
  location: string;
  department: string;
}> = [
  {
    status: "pending",
    time: "Today, 3pm",
    title: "Clean Room",
    assignees: ["Rohan K", "John D"],
    location: "Floor 3, Room 2A",
    department: "F&D",
  },
  {
    status: "completed",
    time: "Today, 5pm",
    title: "Fix AC Unit",
    assignees: ["Sam T"],
    location: "Floor 1, Room 5B",
    department: "Maintenance",
  },
];

function HomeToolbar({ className }: { className?: string }) {
  const tabs = ["Departments", "View 2", "View 3"];

  return (
    <div className={cn("flex items-center justify-between px-6 border-b border-stroke-subtle", className)}>
      <div className="flex items-center">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            type="button"
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              i === 0
                ? "text-text-default border-b-2 border-text-default"
                : "text-text-subtle hover:text-text-default"
            }`}
          >
            <LayoutGrid className="size-4" />
            {tab}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <button type="button" className="text-text-subtle hover:text-text-default transition-colors">
          <ArrowDownUp className="size-4" />
        </button>
        <button type="button" className="text-text-subtle hover:text-text-default transition-colors">
          <Search className="size-4" />
        </button>
        <button type="button" className="text-text-subtle hover:text-text-default transition-colors">
          <Settings className="size-4" />
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          <Plus className="size-4" />
          Create Task
        </button>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <HomeHeader />
      <HomeToolbar className="mt-2" />
      <div className="flex flex-col gap-4 max-w-md p-8">
        {PLACEHOLDER_TASK_CONTENT.map((task) => (
          <RequestCardItem key={task.title} {...task} />
        ))}
      </div>
    </main>
  );
}
