import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownUp,
  ChevronDown,
  LayoutGrid,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import type { RequestStatus } from "@/components/requests/RequestCard";
import { RequestCardItem } from "@/components/requests/RequestCardItem";
import { KanbanColumn } from "@/components/requests/KanbanColumn";
import { cn } from "@/lib/utils";

function HomeHeader() {
  return (
    <header className="px-6 py-5 flex-row gap-1.5 border-b border-stroke-subtle">
      <h1 className="text-2xl font-semibold text-text-default">Home</h1>
      <h2 className="text-sm font-medium text-text-subtle">
        Overview of all tasks currently at play
      </h2>
    </header>
  );
}

function HomeToolbar({ className }: { className?: string }) {
  const tabs = ["Departments", "View 2", "View 3"];

  return (
    <div className={cn("px-6", className)}>
      <div className="flex items-center justify-between border-b border-stroke-subtle">
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
          <button
            type="button"
            className="text-text-subtle hover:text-text-default transition-colors"
          >
            <ArrowDownUp className="size-4" />
          </button>
          <button
            type="button"
            className="text-text-subtle hover:text-text-default transition-colors"
          >
            <Search className="size-4" />
          </button>
          <button
            type="button"
            className="text-text-subtle hover:text-text-default transition-colors"
          >
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
    </div>
  );
}

const FILTER_PILLS = [
  { label: "Grouping", value: "Departments" },
  { label: "Assignee", value: "All" },
  { label: "Priority", value: "All" },
  { label: "Location", value: "All" },
  { label: "Deadline", value: "All" },
];

function HomeFilterBar() {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-stroke-subtle">
      <div className="flex items-center gap-2">
        {FILTER_PILLS.map((pill) => (
          <button
            key={pill.label}
            type="button"
            className="flex items-center gap-1.5 bg-request-completed-secondary rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
          >
            <LayoutGrid className="size-3" />
            <span>
              {pill.label}: <span className="font-semibold">{pill.value}</span>
            </span>
            <ChevronDown className="size-3" />
          </button>
        ))}
        <button
          type="button"
          className="text-xs font-medium text-text-subtle hover:text-text-default transition-colors px-2"
        >
          + Filter
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="text-sm text-text-subtle hover:text-text-default transition-colors"
        >
          Reset
        </button>
        <button
          type="button"
          className="rounded-lg border border-text-default px-4 py-1.5 text-sm font-medium text-text-default hover:bg-zinc-50 transition-colors"
        >
          Save as New View
        </button>
      </div>
    </div>
  );
}


type TaskContent = {
  status: RequestStatus;
  time: string;
  title: string;
  assignees: Array<string>;
  location: string;
  department: string;
};

const PLACEHOLDER_COLUMNS: Array<{ title: string; tasks: Array<TaskContent> }> =
  [
    {
      title: "Food & Beverage",
      tasks: [
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
          time: "Today, 3pm",
          title: "Clean Room",
          assignees: ["Rohan K", "John D"],
          location: "Floor 3, Room 2A",
          department: "F&D",
        },
        {
          status: "completed",
          time: "Today, 3pm",
          title: "Clean Room",
          assignees: ["Rohan K", "John D"],
          location: "Floor 3, Room 2A",
          department: "F&D",
        },
        {
          status: "completed",
          time: "Today, 3pm",
          title: "Clean Room",
          assignees: ["Rohan K", "John D"],
          location: "Floor 3, Room 2A",
          department: "F&D",
        },
      ],
    },
    {
      title: "Maintenance",
      tasks: [
        {
          status: "pending",
          time: "Today, 3pm",
          title: "Clean Room",
          assignees: ["Rohan K", "John D"],
          location: "Floor 3, Room 2A",
          department: "F&D",
        },
        {
          status: "pending",
          time: "Today, 3pm",
          title: "Clean Room",
          assignees: ["Rohan K", "John D"],
          location: "Floor 3, Room 2A",
          department: "F&D",
        },
      ],
    },
    {
      title: "Room Flipping",
      tasks: [
        {
          status: "pending",
          time: "Today, 3pm",
          title: "Clean Room",
          assignees: ["Rohan K", "John D"],
          location: "Floor 3, Room 2A",
          department: "F&D",
        },
        {
          status: "pending",
          time: "Today, 3pm",
          title: "Clean Room",
          assignees: ["Rohan K", "John D"],
          location: "Floor 3, Room 2A",
          department: "F&D",
        },
        {
          status: "pending",
          time: "Today, 3pm",
          title: "Clean Room",
          assignees: ["Rohan K", "John D"],
          location: "Floor 3, Room 2A",
          department: "F&D",
        },
      ],
    },
  ];

export const Route = createFileRoute("/_protected/home")({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <HomeHeader />
      <HomeToolbar className="mt-2" />
      <HomeFilterBar />
      <div className="relative flex-1 overflow-hidden">
        <div className="flex items-stretch gap-6 h-full overflow-x-auto overflow-y-auto p-6 pb-0">
          {PLACEHOLDER_COLUMNS.map((col) => (
            <KanbanColumn key={col.title} title={col.title}>
              {col.tasks.map((task, i) => (
                <RequestCardItem key={i} {...task} />
              ))}
            </KanbanColumn>
          ))}
        </div>

      </div>
    </main>
  );
}
