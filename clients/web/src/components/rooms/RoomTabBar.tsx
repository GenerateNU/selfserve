import { BedDouble, ClipboardCheck, UserRound } from "lucide-react";

type RoomTab = {
  id: "tasks" | "guest-info" | "room-details";
  label: string;
  icon: typeof ClipboardCheck;
};

const roomTabs: Array<RoomTab> = [
  { id: "tasks", label: "Tasks and Issues", icon: ClipboardCheck },
  { id: "guest-info", label: "Guest Information", icon: UserRound },
  { id: "room-details", label: "Room Details", icon: BedDouble },
];

export function RoomTabBar() {
  return (
    <div className="py-3 border-b border-stroke-subtle">
      <div className="flex items-start px-8">
        {roomTabs.map(({ id, label, icon: Icon }) => {
          const isActive = id === "tasks";

          return (
            <button
              key={id}
              type="button"
              className={[
                "inline-flex items-center justify-center gap-2 border-b-2 px-3 py-3 text-sm leading-5",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-750",
              ].join(" ")}
            >
              <Icon className="size-4" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
