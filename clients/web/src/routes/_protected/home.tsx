import { createFileRoute } from "@tanstack/react-router";
import { GuestPageShell } from "@/components/guests/GuestPageShell";
import type { RequestStatus } from "@/components/requests/RequestCard";
import { RequestCardItem } from "@/components/requests/RequestCardItem";

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
          <RequestCardItem key={task.title} {...task} />
        ))}
      </div>
    </GuestPageShell>
  );
}
