import { useState } from "react";
import { X } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { SettingsNav, type SettingsTab } from "./SettingsNav";
import { ProfileTab } from "./ProfileTab";
import { MembersTab } from "./MembersTab";
import { DialogTitle } from "@/components/ui/dialog";

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

  const title = activeTab === "profile" ? (displayName || "User") : tabTitles[activeTab];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-300 ease-out" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 flex h-[90vh] w-[90vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-white shadow-2xl outline-none duration-300 ease-out data-open:animate-in data-open:fade-in-0 data-open:zoom-in-90 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-90">
          <SettingsNav activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Right content panel */}
          <div className="relative flex-1 overflow-y-auto p-12">
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-md p-1.5 text-text-subtle hover:bg-bg-selected hover:text-text-default"
            >
              <X className="size-4" />
            </button>

            <div className="mb-8">
              <DialogTitle className="text-3xl font-bold text-text-default">
                {title}
              </DialogTitle>
            </div>

            {activeTab === "profile" && <ProfileTab />}
            {activeTab === "members" && <MembersTab />}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
