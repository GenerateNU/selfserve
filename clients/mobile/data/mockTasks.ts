export type Priority = "High" | "Middle" | "Low";
export type Department =
  | "Housekeeping"
  | "Room Service"
  | "Maintenance"
  | "Front Desk";

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  department: Department;
  location: string;
  description?: string;
  dueTime?: string;
  isAssigned: boolean;
}

export const myTasks: Task[] = [
  {
    id: "1",
    title: "Clean Up Spill",
    priority: "High",
    department: "Housekeeping",
    location: "Floor 3, Room 2A",
    description: "Carpet cleaner needed",
    dueTime: "Today, 11:30am",
    isAssigned: true,
  },
  {
    id: "2",
    title: "Vacuum Carpet",
    priority: "Middle",
    department: "Housekeeping",
    location: "Floor 3, Room 2A",
    isAssigned: true,
  },
  {
    id: "3",
    title: "Vacuum Carpet",
    priority: "Low",
    department: "Housekeeping",
    location: "Floor 3, Room 2A",
    isAssigned: true,
  },
  {
    id: "4",
    title: "Vacuum Carpet",
    priority: "Low",
    department: "Housekeeping",
    location: "Floor 3, Room 2A",
    isAssigned: true,
  },
  {
    id: "5",
    title: "Vacuum Carpet",
    priority: "Low",
    department: "Housekeeping",
    location: "Floor 3, Room 2A",
    isAssigned: true,
  },
];

export const unassignedTasks: Task[] = [
  {
    id: "6",
    title: "Breakfast for VIP",
    priority: "High",
    department: "Room Service",
    location: "Floor 30, Penthouse 2",
    description:
      "Lorem Ipsum dolor sit amet description here...",
    isAssigned: false,
  },
  {
    id: "7",
    title: "Cleanup Brunch Cart",
    priority: "High",
    department: "Room Service",
    location: "Floor 30, Penthouse 5",
    description:
      "Lorem Ipsum dolor sit amet description here...",
    isAssigned: false,
  },
  {
    id: "8",
    title: "Reheated Towels for Guest",
    priority: "Middle",
    department: "Room Service",
    location: "Floor 4",
    isAssigned: false,
  },
  {
    id: "9",
    title: "Steamed Blankets & Pillowcases for Family of 5",
    priority: "Middle",
    department: "Room Service",
    location: "Floor 4",
    isAssigned: false,
  },
];
