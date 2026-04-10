import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check, ChevronDown, Search, UserPlus } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useGetUsersIdHook } from "@shared/api/generated/endpoints/users/users.ts";
import { useCustomInstance } from "@shared/api/orval-mutator";
import { cn, getInitials, hashNameToColor } from "@/lib/utils";
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
  departments: Array<string>;
  joinedAt: string;
};

type ApiUser = {
  id: string;
  first_name?: string;
  last_name?: string;
  primary_email?: string;
  profile_picture?: string;
  role?: string;
  departments?: Array<string>;
  created_at?: string;
};

type HotelUsersPage = {
  users: Array<ApiUser>;
  next_cursor: string;
};

function toMember(u: ApiUser): Member {
  const name =
    [u.first_name, u.last_name].filter(Boolean).join(" ") || "Unknown";
  return {
    id: u.id,
    name,
    email: u.primary_email ?? "",
    avatarUrl: u.profile_picture ?? undefined,
    role: u.role === "Admin" ? "Admin" : "Member",
    departments: u.departments ?? [],
    joinedAt: u.created_at
      ? new Date(u.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "",
  };
}

const ROLES: Array<{ role: Role; description: string }> = [
  { role: "Admin", description: "Can manage members and most settings" },
  { role: "Member", description: "Can view and use workspace content" },
];

// Shared grid template applied to both header and every row
const ROW_GRID = "grid grid-cols-[1fr_12rem_8rem_7rem] items-center gap-x-4";

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
        {member.departments.length > 0 ? member.departments.join(", ") : "—"}
      </span>

      <span className="text-xs text-text-subtle">{member.joinedAt}</span>

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
  const [search, setSearch] = useState("");
  const [roleOverrides, setRoleOverrides] = useState<Record<string, Role>>({});

  const { user: clerkUser } = useUser();
  const getUsersId = useGetUsersIdHook();
  const fetchHotelUsers = useCustomInstance<HotelUsersPage>();

  const { data: backendUser } = useQuery({
    queryKey: ["user", clerkUser?.id],
    queryFn: () => getUsersId(clerkUser!.id),
    enabled: !!clerkUser?.id,
  });

  const hotelId = backendUser?.hotel_id;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["hotel-users", hotelId],
      queryFn: ({ pageParam }: { pageParam: string }) =>
        fetchHotelUsers({
          url: `/hotels/${hotelId}/users`,
          method: "GET",
          params: pageParam ? { cursor: pageParam } : undefined,
        }),
      enabled: !!hotelId,
      initialPageParam: "",
      getNextPageParam: (lastPage) => lastPage.next_cursor || undefined,
    });

  const allUsers = data?.pages.flatMap((p) => p.users) ?? [];

  const members: Array<Member> = allUsers.map((u) => {
    const base = toMember(u);
    return roleOverrides[u.id] !== undefined
      ? { ...base, role: roleOverrides[u.id] }
      : base;
  });

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );

  function handleRoleChange(id: string, role: Role) {
    setRoleOverrides((prev) => ({ ...prev, [id]: role }));
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
        <p className="text-xs font-medium text-text-subtle">Departments</p>
        <p className="text-xs font-medium text-text-subtle">Joined</p>
        <p className="pl-2 text-xs font-medium text-text-subtle">Role</p>
      </div>

      {/* Rows */}
      <div className="pt-1">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-text-subtle">
            Loading members...
          </p>
        ) : filtered.length === 0 ? (
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

      {/* Load more */}
      {hasNextPage && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-xs text-text-subtle hover:text-text-default transition-colors disabled:opacity-50"
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
