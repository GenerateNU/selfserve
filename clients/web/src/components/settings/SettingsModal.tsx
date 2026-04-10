import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { SettingsNav, type SettingsTab } from "./SettingsNav";
import { SettingsContentPanel } from "./SettingsContentPanel";

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

const tabTitles: Record<SettingsTab, string> = {
  profile: "",
  members: "Members",
};

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const displayName =
    user?.fullName ??
    [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  const title =
    activeTab === "profile" ? displayName || "User" : tabTitles[activeTab];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-300 ease-out" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 flex h-[90vh] w-[90vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-white shadow-2xl outline-none duration-300 ease-out data-open:animate-in data-open:fade-in-0 data-open:zoom-in-90 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-90">
          <SettingsNav activeTab={activeTab} onTabChange={setActiveTab} />
          <SettingsContentPanel
            activeTab={activeTab}
            title={title}
            onClose={onClose}
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
