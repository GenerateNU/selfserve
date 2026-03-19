import { createFileRoute } from "@tanstack/react-router";
import type { RequestStatus } from "@/components/requests/RequestCard";
import { RequestCardItem } from "@/components/requests/RequestCardItem";

function HomeHeader() {
  return (
    <header className="px-6 py-5 flex-row gap-1.5 justify-between border-b border-stroke-subtle">
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

function HomePage() {
  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <HomeHeader />
      <div className="flex flex-col gap-4 max-w-md p-8">
        {PLACEHOLDER_TASK_CONTENT.map((task) => (
          <RequestCardItem key={task.title} {...task} />
        ))}
      </div>
    </main>
  );
}
