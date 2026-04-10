import { useState } from "react";
import { Check, ChevronDown, Search, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Role = "Owner" | "Admin" | "Member";

type Member = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: Role;
  joinedAt: string;
};

const MOCK_MEMBERS: Member[] = [
  {
    id: "1",
    name: "Isabelle Fontaine",
    email: "isabelle.fontaine@grandhyatt.com",
    role: "Owner",
    joinedAt: "Jan 3, 2024",
  },
  {
    id: "2",
    name: "Marcus Webb",
    email: "marcus.webb@grandhyatt.com",
    role: "Admin",
    joinedAt: "Feb 14, 2024",
  },
  {
    id: "3",
    name: "Priya Nair",
    email: "priya.nair@grandhyatt.com",
    role: "Admin",
    joinedAt: "Mar 1, 2024",
  },
  {
    id: "4",
    name: "Tomás Herrera",
    email: "tomas.herrera@grandhyatt.com",
    role: "Member",
    joinedAt: "Mar 22, 2024",
  },
  {
    id: "5",
    name: "Yuki Tanaka",
    email: "yuki.tanaka@grandhyatt.com",
    role: "Member",
    joinedAt: "Apr 5, 2024",
  },
  {
    id: "6",
    name: "Amara Diallo",
    email: "amara.diallo@grandhyatt.com",
    role: "Member",
    joinedAt: "May 18, 2024",
  },
  {
    id: "7",
    name: "Lena Hoffmann",
    email: "lena.hoffmann@grandhyatt.com",
    role: "Member",
    joinedAt: "Jun 2, 2024",
  },
];

const ROLES: Role[] = ["Owner", "Admin", "Member"];

const roleStyles: Record<Role, string> = {
  Owner: "text-primary",
  Admin: "text-info",
  Member: "text-text-secondary",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function MemberAvatar({ member }: { member: Member }) {
  if (member.avatarUrl) {
    return (
      <img
        src={member.avatarUrl}
        alt={member.name}
        className="size-8 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-selected text-xs font-medium text-text-default">
      {getInitials(member.name)}
    </div>
  );
}

type RolePickerProps = {
  role: Role;
  onChange: (role: Role) => void;
  disabled?: boolean;
};

function RolePicker({ role, onChange, disabled }: RolePickerProps) {
  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors",
          roleStyles[role],
          !disabled && "hover:bg-bg-selected cursor-pointer",
          disabled && "cursor-default opacity-60",
        )}
      >
        {role}
        {!disabled && <ChevronDown className="size-3.5 opacity-60" />}
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-44!">
        <div className="p-1">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onChange(r)}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-bg-selected"
            >
              <span className={cn("font-medium", roleStyles[r])}>{r}</span>
              {r === role && <Check className="size-3.5 text-text-subtle" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

type MemberRowProps = {
  member: Member;
  onRoleChange: (id: string, role: Role) => void;
};

function MemberRow({ member, onRoleChange }: MemberRowProps) {
  const isOwner = member.role === "Owner";

  return (
    <div className="flex items-center gap-4 rounded-lg px-3 py-2.5 hover:bg-bg-selected/50 transition-colors">
      {/* Avatar + identity */}
      <MemberAvatar member={member} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-default">
          {member.name}
        </p>
        <p className="truncate text-xs text-text-subtle">{member.email}</p>
      </div>

      {/* Joined date */}
      <span className="hidden shrink-0 text-xs text-text-subtle sm:block">
        Joined {member.joinedAt}
      </span>

      {/* Role picker */}
      <RolePicker
        role={member.role}
        onChange={(r) => onRoleChange(member.id, r)}
        disabled={isOwner}
      />
    </div>
  );
}

export function MembersTab() {
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [search, setSearch] = useState("");

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );

  function handleRoleChange(id: string, role: Role) {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role } : m)),
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-text-subtle" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-stroke-subtle bg-bg-primary py-2 pl-8 pr-3 text-sm text-text-default placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          type="button"
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          <UserPlus className="size-3.5" />
          Invite
        </button>
      </div>

      {/* Column headers */}
      <div className="mb-1 flex items-center gap-4 px-3 text-xs font-medium text-text-subtle">
        <div className="flex-1">Member</div>
        <div className="hidden sm:block w-28">Joined</div>
        <div className="w-20">Role</div>
      </div>

      <div className="divide-y divide-stroke-subtle/50">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-subtle">
            No members match your search.
          </p>
        ) : (
          filtered.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              onRoleChange={handleRoleChange}
            />
          ))
        )}
      </div>

      <p className="mt-4 px-3 text-xs text-text-subtle">
        {members.length} member{members.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
