import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ProfileTab } from "./ProfileTab";
import { MembersTab } from "./MembersTab";
import { MemberDetailPanel } from "./MemberDetailPanel";
import type { Member } from "./MembersTab";
import type { SettingsTab } from "./SettingsNav";
import { DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type SettingsContentPanelProps = {
  activeTab: SettingsTab;
  title: string;
  onClose: () => void;
};

export function SettingsContentPanel({
  activeTab,
  title,
  onClose,
}: SettingsContentPanelProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberNotes, setMemberNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    setSelectedMember(null);
  }, [activeTab]);

  function handleRoleChange(role: "Admin" | "Member") {
    setSelectedMember((prev) => (prev ? { ...prev, role } : null));
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Close button — always on top */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-20 rounded-md p-1.5 text-text-subtle hover:bg-bg-selected hover:text-text-default"
      >
        <X className="size-4" />
      </button>

      {/* Main scrollable content */}
      <div className="h-full overflow-y-auto p-12">
        <div className="mb-8">
          <DialogTitle className="text-3xl font-bold text-text-default">
            {title}
          </DialogTitle>
        </div>

        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "members" && (
          <MembersTab onSelectMember={setSelectedMember} />
        )}
      </div>

      {/* Member detail panel — slides in over content */}
      <div
        className={cn(
          "absolute inset-0 z-10 bg-white transition-transform duration-300 ease-in-out",
          selectedMember ? "translate-x-0" : "translate-x-full",
        )}
      >
        {selectedMember && (
          <MemberDetailPanel
            member={selectedMember}
            note={memberNotes[selectedMember.id] ?? ""}
            onNoteChange={(note) =>
              setMemberNotes((prev) => ({
                ...prev,
                [selectedMember.id]: note,
              }))
            }
            onRoleChange={handleRoleChange}
            onBack={() => setSelectedMember(null)}
          />
        )}
      </div>
    </div>
  );
}
