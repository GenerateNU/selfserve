import { useState } from "react";
import { Check, ChevronDown, Search, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Role = "Admin" | "Member";

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
    role: "Admin",
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

const ROLES: { role: Role; description: string }[] = [
  { role: "Admin", description: "Can manage members and most settings" },
  { role: "Member", description: "Can view and use workspace content" },
];

// Soft avatar background colors cycled by member index
const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function MemberAvatar({
  member,
  colorClass,
}: {
  member: Member;
  colorClass: string;
}) {
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
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        colorClass,
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
      <DropdownMenuTrigger className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-text-secondary hover:bg-bg-selected transition-colors outline-none">
        {role}
        <ChevronDown className="size-3 text-text-subtle opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {ROLES.map(({ role: r, description }) => (
          <DropdownMenuItem
            key={r}
            onClick={() => onChange(r)}
            className="flex items-start gap-3 px-3 py-2.5 cursor-pointer"
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
  colorClass: string;
  onRoleChange: (id: string, role: Role) => void;
};

function MemberRow({ member, colorClass, onRoleChange }: MemberRowProps) {
  return (
    <div className="flex items-center gap-3 px-2 py-2">
      <MemberAvatar member={member} colorClass={colorClass} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-default leading-tight">
          {member.name}
        </p>
        <p className="truncate text-xs text-text-subtle">{member.email}</p>
      </div>

      <span className="hidden shrink-0 text-xs text-text-subtle sm:block w-28 text-right">
        {member.joinedAt}
      </span>

      <div className="shrink-0">
        <RolePicker
          role={member.role}
          onChange={(r) => onRoleChange(member.id, r)}
        />
      </div>
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
    <div className="-mx-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between px-4">
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
      <div className="relative mb-3 px-4">
        <Search className="absolute left-7 top-1/2 size-3.5 -translate-y-1/2 text-text-subtle" />
        <input
          type="text"
          placeholder="Filter by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-stroke-subtle bg-transparent py-1.5 pl-8 pr-3 text-sm text-text-default placeholder:text-text-subtle focus:outline-none focus:border-stroke-default transition-colors"
        />
      </div>

      {/* Column labels */}
      <div className="mb-0.5 flex items-center gap-3 px-4 pb-1 border-b border-stroke-subtle">
        <div className="size-8 shrink-0" />
        <p className="flex-1 text-xs font-medium text-text-subtle">User</p>
        <p className="hidden sm:block w-28 text-right text-xs font-medium text-text-subtle">
          Joined
        </p>
        <p className="w-20 text-right text-xs font-medium text-text-subtle pr-2">
          Role
        </p>
      </div>

      {/* Rows */}
      <div className="px-2 pt-1">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-subtle">
            No members match your search.
          </p>
        ) : (
          filtered.map((member, i) => (
            <MemberRow
              key={member.id}
              member={member}
              colorClass={AVATAR_COLORS[i % AVATAR_COLORS.length]}
              onRoleChange={handleRoleChange}
            />
          ))
        )}
      </div>
    </div>
  );
}
