import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Check, ChevronDown, Search, UserPlus } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useGetUsersIdHook } from "@shared/api/generated/endpoints/users/users.ts";
import { useCustomInstance } from "@shared/api/orval-mutator";
import type { User } from "@shared/api/generated/models";
import { cn, getInitials, hashNameToColor } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Role = "Admin" | "Member";

type UserPage = {
  users: Array<User> | null;
  next_cursor: string;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: Role;
  departments: Array<string>;
  joinedAt: string;
};

const ROLES: Array<{ role: Role; description: string }> = [
  { role: "Admin", description: "Can manage members and most settings" },
  { role: "Member", description: "Can view and use workspace content" },
];

const ROW_GRID = "grid grid-cols-[1fr_12rem_8rem_7rem] items-center gap-x-4";

const SEARCH_DEBOUNCE_MS = 200;

function toMember(user: User): Member {
  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") || "Unknown";
  return {
    id: user.id!,
    name: fullName,
    email: user.primary_email ?? "",
    avatarUrl: user.profile_picture ?? undefined,
    role: user.role === "Admin" ? "Admin" : "Member",
    departments: user.department ? [user.department] : [],
    joinedAt: user.created_at
      ? new Date(user.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "",
  };
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
        {ROLES.map(({ role: roleOption, description }) => (
          <DropdownMenuItem
            key={roleOption}
            onClick={() => onChange(roleOption)}
            className="flex items-start gap-3 px-3 py-2.5"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-text-default">
                {roleOption}
              </p>
              <p className="text-xs text-text-subtle">{description}</p>
            </div>
            {roleOption === role && (
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
  onSelect: (member: Member) => void;
};

function MemberRow({ member, onSelect }: MemberRowProps) {
  return (
    <div className={cn(ROW_GRID, "py-2")}>
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

      <span className="truncate text-xs text-text-subtle">
        {member.departments.length > 0 ? member.departments.join(", ") : "—"}
      </span>

      <span className="text-xs text-text-subtle">{member.joinedAt}</span>

      <RolePicker role={member.role} onChange={() => {}} />
    </div>
  );
}

type MembersTabProps = {
  onSelectMember: (member: Member) => void;
};

export function MembersTab({ onSelectMember }: MembersTabProps) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(searchInput),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { user: clerkUser } = useUser();
  const getCurrentUser = useGetUsersIdHook();
  const searchUsers = useCustomInstance<UserPage>();

  const { data: currentUser } = useQuery({
    queryKey: ["user", clerkUser?.id],
    queryFn: () => getCurrentUser(clerkUser!.id),
    enabled: !!clerkUser?.id,
  });

  const hotelId = currentUser?.hotel_id;

  const {
    data: membersPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["hotel-members", hotelId, debouncedSearch],
    queryFn: ({ pageParam }: { pageParam: string }) =>
      searchUsers({
        url: "/users/search",
        method: "POST",
        data: {
          hotel_id: hotelId!,
          cursor: pageParam || undefined,
          q: debouncedSearch || undefined,
        },
      }),
    enabled: !!hotelId,
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.next_cursor || undefined,
  });

  const allMembers =
    membersPages?.pages.flatMap((page) => (page.users ?? []).map(toMember)) ??
    [];

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-text-subtle">
          {allMembers.length} member{allMembers.length !== 1 ? "s" : ""}
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
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full rounded-md border border-stroke-subtle bg-transparent py-1.5 pl-8 pr-3 text-sm text-text-default placeholder:text-text-subtle focus:outline-none focus:border-stroke-default transition-colors"
        />
      </div>

      {/* Column headers */}
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
        ) : allMembers.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-subtle">
            No members match your search.
          </p>
        ) : (
          allMembers.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
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
