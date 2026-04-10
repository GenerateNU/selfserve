import { ArrowLeft, Check, ChevronDown } from "lucide-react";
import type { Member } from "./MembersTab";
import { cn, getInitials, hashNameToColor } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Role = "Admin" | "Member";

const ROLES: Array<{ role: Role; description: string }> = [
  { role: "Admin", description: "Can manage members and most settings" },
  { role: "Member", description: "Can view and use workspace content" },
];

type MemberDetailPanelProps = {
  member: Member;
  note: string;
  onNoteChange: (note: string) => void;
  onRoleChange: (role: Role) => void;
  onBack: () => void;
};

export function MemberDetailPanel({
  member,
  note,
  onNoteChange,
  onRoleChange,
  onBack,
}: MemberDetailPanelProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto p-12">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="mb-8 flex items-center gap-1.5 self-start rounded-md px-2 py-1.5 text-sm text-text-subtle hover:bg-bg-selected hover:text-text-default transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Members
      </button>

      {/* Hero */}
      <div className="mb-8 flex items-center gap-5">
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt={member.name}
            className="size-20 rounded-full object-cover"
          />
        ) : (
          <div
            className={cn(
              "flex size-20 shrink-0 items-center justify-center rounded-full text-2xl font-semibold",
              hashNameToColor(member.name),
            )}
          >
            {getInitials(member.name)}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-text-default">
            {member.name}
          </h2>
          <p className="text-sm text-text-subtle">{member.email}</p>
        </div>
      </div>

      {/* Info rows */}
      <div className="mb-8 divide-y divide-stroke-subtle/50 border-y border-stroke-subtle/50">
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-text-subtle">Departments</span>
          <span className="text-sm font-medium text-text-default">
            {member.departments.length > 0
              ? member.departments.join(", ")
              : "—"}
          </span>
        </div>

        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-text-subtle">Role</span>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-text-secondary hover:bg-bg-selected transition-colors outline-none">
              {member.role}
              <ChevronDown className="size-3 text-text-subtle opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {ROLES.map(({ role: r, description }) => (
                <DropdownMenuItem
                  key={r}
                  onClick={() => onRoleChange(r)}
                  className="flex items-start gap-3 px-3 py-2.5"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-default">{r}</p>
                    <p className="text-xs text-text-subtle">{description}</p>
                  </div>
                  {r === member.role && (
                    <Check className="mt-0.5 size-3.5 shrink-0 text-text-subtle" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-text-subtle">Joined</span>
          <span className="text-sm font-medium text-text-default">
            {member.joinedAt}
          </span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <p className="mb-2 text-sm font-medium text-text-default">Notes</p>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Add a note about this member..."
          rows={5}
          className="w-full resize-none rounded-lg border border-stroke-subtle bg-transparent p-3 text-sm text-text-default placeholder:text-text-subtle focus:border-stroke-default focus:outline-none transition-colors"
        />
      </div>
    </div>
  );
}
