export type NotificationAction = {
  label: string;
  onClick: () => void;
};

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  unread: boolean;
  action?: NotificationAction;
};

export type NotificationGroup = {
  label: string;
  items: Array<NotificationItem>;
};

// TODO: replace with shared client call
export const MOCK_NOTIFICATIONS: Array<NotificationGroup> = [
  {
    label: "Today",
    items: [
      {
        id: "1",
        title: "New Task Assigned",
        description:
          "Your new tasks have been assigned for the day. Check them out.",
        timestamp: "Updated 2m ago",
        unread: true,
      },
      {
        id: "2",
        title: "AI Assistance Task Created!",
        description:
          "Your new tasks have been assigned for the day. Check them out.",
        timestamp: "Updated 2m ago",
        unread: true,
      },
      {
        id: "3",
        title: "Rohan K. has dropped his task",
        description: "Task dropped: delivering package to Floor 2, Room 3A",
        timestamp: "Updated 2m ago",
        unread: true,
        action: {
          label: "Reassign Task",
          onClick: () => {},
        },
      },
    ],
  },
  {
    label: "This Week",
    items: [
      {
        id: "4",
        title: "New Task Assigned",
        description:
          "Your new tasks have been assigned for the day. Check them out.",
        timestamp: "Updated 2m ago",
        unread: true,
      },
      {
        id: "5",
        title: "New Task Assigned",
        description:
          "Your new tasks have been assigned for the day. Check them out.",
        timestamp: "39m",
        unread: false,
      },
    ],
  },
  {
    label: "Older",
    items: [
      {
        id: "6",
        title: "New Task Assigned",
        description:
          "Your new tasks have been assigned for the day. Check them out.",
        timestamp: "39m",
        unread: false,
      },
      {
        id: "7",
        title: "New Task Assigned",
        description:
          "Your new tasks have been assigned for the day. Check them out.",
        timestamp: "39m",
        unread: false,
      },
      {
        id: "8",
        title: "New Task Assigned",
        description:
          "Your new tasks have been assigned for the day. Check them out.",
        timestamp: "39m",
        unread: false,
      },
    ],
  },
];
