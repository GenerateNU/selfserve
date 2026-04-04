import type { GuestDrawerTab } from "./guest-drawer-state";
import { DrawerShell } from "@/components/ui/DrawerShell";

type GuestDetailsDrawerProps = {
  guestName: string;
  activeTab: GuestDrawerTab;
  onChangeTab: (tab: GuestDrawerTab) => void;
  onClose: () => void;
  children: React.ReactNode;
};

const tabs: Array<{ label: string; value: GuestDrawerTab }> = [
  { label: "Profile", value: "profile" },
  { label: "Visit Activity", value: "activity" },
];

export function GuestDetailsDrawer({
  guestName,
  activeTab,
  onChangeTab,
  onClose,
  children,
}: GuestDetailsDrawerProps) {
  return (
    <DrawerShell title={guestName} onClose={onClose}>
      <div className="border-b border-stroke-subtle">
        <div className="grid grid-cols-2">
          {tabs.map((tab) => {
            const selected = tab.value === activeTab;

            return (
              <button
                key={tab.value}
                type="button"
                aria-pressed={selected}
                className={`border-b-2 px-4 py-3 text-sm ${
                  selected
                    ? "border-primary text-primary"
                    : "border-transparent text-text-subtle"
                }`}
                onClick={() => onChangeTab(tab.value)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {children}
    </DrawerShell>
  );
}
