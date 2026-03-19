import { createFileRoute } from "@tanstack/react-router";
import { GuestPageShell } from "@/components/guests/GuestPageShell";
import { RequestCard } from "@/components/requests/RequestCard";
import type { RequestStatus } from "@/components/requests/RequestCard";
import { Clock, MapPin, Home } from "lucide-react";

export const Route = createFileRoute("/_protected/home")({
  component: HomePage,
});

const PLACEHOLDER_TASK_CONTENT: {
  status: RequestStatus;
  time: string;
  title: string;
  assignees: string[];
  location: string;
  department: string;
}[] = [
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
    <GuestPageShell title="Home">
      <div className="flex flex-col gap-4 max-w-md">
        {PLACEHOLDER_TASK_CONTENT.map((task) => (
          <RequestCard key={task.title} status={task.status}>
            <div className="flex items-center gap-2 self-start rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-500">
              <Clock className="size-4" />
              {task.time}
            </div>
            <span className="text-xl font-bold text-zinc-900">{task.title}</span>
            <div className="flex gap-2">
              {task.assignees.map((name) => (
                <span
                  key={name}
                  className="rounded-md bg-zinc-100 px-3 py-1 text-sm text-zinc-600"
                >
                  {name}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <span className="flex items-center gap-1">
                <MapPin className="size-4" />
                {task.location}
              </span>
              <span className="flex items-center gap-1">
                <Home className="size-4" />
                {task.department}
              </span>
            </div>
          </RequestCard>
        ))}
      </div>
    </GuestPageShell>
  );
}
