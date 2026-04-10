import { useState } from "react";
import { Check, ChevronDown, Search, UserPlus } from "lucide-react";
import { cn, hashNameToColor } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Role = "Admin" | "Member";

export type Member = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: Role;
  department: string;
  joinedAt: string;
};

const MOCK_MEMBERS: Member[] = [
  {
    id: "1",
    name: "Isabelle Fontaine",
    email: "isabelle.fontaine@grandhyatt.com",
    role: "Admin",
    department: "Front Desk",
    joinedAt: "Jan 3, 2024",
  },
  {
    id: "2",
    name: "Marcus Webb",
    email: "marcus.webb@grandhyatt.com",
    role: "Admin",
    department: "Maintenance",
    joinedAt: "Feb 14, 2024",
  },
  {
    id: "3",
    name: "Priya Nair",
    email: "priya.nair@grandhyatt.com",
    role: "Admin",
    department: "Housekeeping",
    joinedAt: "Mar 1, 2024",
  },
  {
    id: "4",
    name: "Tomás Herrera",
    email: "tomas.herrera@grandhyatt.com",
    role: "Member",
    department: "Maintenance",
    joinedAt: "Mar 22, 2024",
  },
  {
    id: "5",
    name: "Yuki Tanaka",
    email: "yuki.tanaka@grandhyatt.com",
    role: "Member",
    department: "Food & Beverage",
    joinedAt: "Apr 5, 2024",
  },
  {
    id: "6",
    name: "Amara Diallo",
    email: "amara.diallo@grandhyatt.com",
    role: "Member",
    department: "Housekeeping",
    joinedAt: "May 18, 2024",
  },
  {
    id: "7",
    name: "Lena Hoffmann",
    email: "lena.hoffmann@grandhyatt.com",
    role: "Member",
    department: "Front Desk",
    joinedAt: "Jun 2, 2024",
  },
];

const ROLES: { role: Role; description: string }[] = [
  { role: "Admin", description: "Can manage members and most settings" },
  { role: "Member", description: "Can view and use workspace content" },
];

// Shared grid template applied to both header and every row
const ROW_GRID = "grid grid-cols-[1fr_10rem_8rem_7rem] items-center gap-x-4";

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
        className="size-8 rounded-full object-cover"
      />
    );
  }
  return (
    <div
      className={cn(
        "flex size-8 items-center justify-center rounded-full text-xs font-semibold",
        hashNameToColor(member.name),
      )}
    >
      {getInitials(member.name)}
    </div>
  );
}

type RolePickerProps = {
  role: Role;
  onChange: (role: Role) => void;
};

function RolePicker({ role, onChange }: RolePickerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1 text-sm text-text-secondary hover:bg-bg-selected transition-colors outline-none">
        {role}
        <ChevronDown className="size-3 text-text-subtle opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {ROLES.map(({ role: r, description }) => (
          <DropdownMenuItem
            key={r}
            onClick={() => onChange(r)}
            className="flex items-start gap-3 px-3 py-2.5"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-text-default">{r}</p>
              <p className="text-xs text-text-subtle">{description}</p>
            </div>
            {r === role && (
              <Check className="mt-0.5 size-3.5 shrink-0 text-text-subtle" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type MemberRowProps = {
  member: Member;
  onRoleChange: (id: string, role: Role) => void;
  onSelect: (member: Member) => void;
};

function MemberRow({ member, onRoleChange, onSelect }: MemberRowProps) {
  return (
    <div className={cn(ROW_GRID, "py-2")}>
      <div>
        <button
          type="button"
          onClick={() => onSelect(member)}
          className="group inline-flex items-center gap-2.5 cursor-pointer"
        >
          <MemberAvatar member={member} />
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-medium text-text-default leading-tight group-hover:underline">
              {member.name}
            </p>
            <p className="truncate text-xs text-text-subtle">{member.email}</p>
          </div>
        </button>
      </div>

      <span className="truncate text-xs text-text-subtle">
        {member.department}
      </span>

      <span className="text-xs text-text-subtle">
        {member.joinedAt}
      </span>

      <RolePicker
        role={member.role}
        onChange={(r) => onRoleChange(member.id, r)}
      />
    </div>
  );
}

type MembersTabProps = {
  onSelectMember: (member: Member) => void;
};

export function MembersTab({ onSelectMember }: MembersTabProps) {
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
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-text-subtle">
          {members.length} member{members.length !== 1 ? "s" : ""}
        </p>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-text-default hover:bg-bg-selected transition-colors"
        >
          <UserPlus className="size-3.5" />
          Add members
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-text-subtle" />
        <input
          type="text"
          placeholder="Filter by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-stroke-subtle bg-transparent py-1.5 pl-8 pr-3 text-sm text-text-default placeholder:text-text-subtle focus:outline-none focus:border-stroke-default transition-colors"
        />
      </div>

      {/* Column headers — same grid as rows */}
      <div className={cn(ROW_GRID, "pb-1.5 border-b border-stroke-subtle")}>
        <p className="text-xs font-medium text-text-subtle">User</p>
        <p className="text-xs font-medium text-text-subtle">Department</p>
        <p className="text-xs font-medium text-text-subtle">Joined</p>
        <p className="pl-2 text-xs font-medium text-text-subtle">Role</p>
      </div>

      {/* Rows */}
      <div className="pt-1">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-subtle">
            No members match your search.
          </p>
        ) : (
          filtered.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              onRoleChange={handleRoleChange}
              onSelect={onSelectMember}
            />
          ))
        )}
      </div>
    </div>
  );
}
