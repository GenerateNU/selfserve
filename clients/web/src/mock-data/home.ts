import type { RequestStatus } from "@/components/requests/RequestCard";

export type TaskContent = {
  status: RequestStatus;
  time: string;
  title: string;
  assignees: Array<string>;
  location: string;
  department: string;
};

export const PLACEHOLDER_COLUMNS: Array<{
  title: string;
  tasks: Array<TaskContent>;
}> = [
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
  {
    title: "Front Desk",
    tasks: [
      {
        status: "pending",
        time: "Today, 1pm",
        title: "Guest Check-in",
        assignees: ["Alice M"],
        location: "Floor 1, Lobby",
        department: "Front Desk",
      },
      {
        status: "completed",
        time: "Today, 2pm",
        title: "Luggage Storage",
        assignees: ["Alice M", "Ben T"],
        location: "Floor 1, Lobby",
        department: "Front Desk",
      },
      {
        status: "pending",
        time: "Today, 4pm",
        title: "Late Check-out Request",
        assignees: ["Ben T"],
        location: "Floor 2, Room 12",
        department: "Front Desk",
      },
      {
        status: "completed",
        time: "Today, 5pm",
        title: "Key Replacement",
        assignees: ["Alice M"],
        location: "Floor 3, Room 7",
        department: "Front Desk",
      },
      {
        status: "pending",
        time: "Today, 6pm",
        title: "Wake-up Call",
        assignees: ["Ben T"],
        location: "Floor 4, Room 21",
        department: "Front Desk",
      },
    ],
  },
  {
    title: "Housekeeping",
    tasks: [
      {
        status: "pending",
        time: "Today, 9am",
        title: "Turn Down Service",
        assignees: ["Sara L"],
        location: "Floor 2, Room 8",
        department: "Housekeeping",
      },
      {
        status: "completed",
        time: "Today, 10am",
        title: "Towel Restock",
        assignees: ["Sara L", "Mike P"],
        location: "Floor 3, Room 14",
        department: "Housekeeping",
      },
      {
        status: "pending",
        time: "Today, 11am",
        title: "Deep Clean",
        assignees: ["Mike P"],
        location: "Floor 4, Room 3",
        department: "Housekeeping",
      },
      {
        status: "pending",
        time: "Today, 1pm",
        title: "Minibar Restock",
        assignees: ["Sara L"],
        location: "Floor 2, Room 9",
        department: "Housekeeping",
      },
    ],
  },
  {
    title: "Concierge",
    tasks: [
      {
        status: "pending",
        time: "Today, 2pm",
        title: "Restaurant Booking",
        assignees: ["Dana K"],
        location: "Floor 1, Lobby",
        department: "Concierge",
      },
      {
        status: "completed",
        time: "Today, 3pm",
        title: "Taxi Arrangement",
        assignees: ["Dana K"],
        location: "Floor 1, Entrance",
        department: "Concierge",
      },
      {
        status: "pending",
        time: "Today, 5pm",
        title: "Tour Booking",
        assignees: ["Dana K", "Rohan K"],
        location: "Floor 1, Lobby",
        department: "Concierge",
      },
    ],
  },
];
