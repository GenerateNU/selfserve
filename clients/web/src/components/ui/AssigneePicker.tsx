import { useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useCustomInstance, useGetUsersIdHook } from "@shared";
import type { User } from "@shared";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SearchBar } from "@/components/ui/SearchBar";
import { cn, useDebounce } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";

type SearchUsersResponse = {
  users: Array<User>;
  next_cursor: string;
};

type AssigneePickerProps = {
  hotelId: string;
  selectedUser?: User;
  initialUserId?: string;
  onSelect: (user: User) => void;
};

export function AssigneePicker({
  hotelId,
  selectedUser,
  initialUserId,
  onSelect,
}: AssigneePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const loadMoreRef = useRef<HTMLButtonElement>(null);

  const searchUsers = useCustomInstance<SearchUsersResponse>();
  const getUsersId = useGetUsersIdHook();

  const { data: initialUser } = useQuery({
    queryKey: ["user", initialUserId],
    queryFn: () => getUsersId(initialUserId!),
    enabled: !!initialUserId && !selectedUser,
  });

  const displayUser = selectedUser ?? initialUser;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["users", "search", hotelId, debouncedSearch],
      queryFn: ({ pageParam }) =>
        searchUsers({
          url: "/users/search",
          method: "POST",
          data: {
            hotel_id: hotelId,
            cursor: pageParam || undefined,
            q: debouncedSearch || undefined,
          },
        }),
      initialPageParam: "",
      getNextPageParam: (lastPage) => lastPage.next_cursor || undefined,
      enabled: open && !!hotelId,
    });

  const users = data?.pages.flatMap((p) => p.users) ?? [];

  function handleSelect(user: User) {
    onSelect(user);
    setOpen(false);
    setSearch("");
  }

  const triggerLabel = displayUser
    ? `${displayUser.first_name ?? ""} ${displayUser.last_name ?? ""}`.trim()
    : "Unassigned";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-bg-selected",
          displayUser ? "text-text-default" : "text-text-subtle",
        )}
      >
        {displayUser && <UserAvatar user={displayUser} />}
        {triggerLabel}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="w-72 p-0"
      >
        <div className="border-b border-stroke-subtle p-2">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name..."
            autoFocus
          />
        </div>
        <div className="flex max-h-60 flex-col overflow-y-auto">
          {isLoading && (
            <p className="px-3 py-4 text-center text-sm text-text-subtle">
              Loading...
            </p>
          )}
          {!isLoading && users.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-text-subtle">
              No staff found
            </p>
          )}
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSelect(user)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-bg-selected",
                displayUser?.id === user.id && "bg-bg-selected",
              )}
            >
              <UserAvatar user={user} />
              <div className="min-w-0">
                <p className="truncate text-sm text-text-default">
                  {user.first_name} {user.last_name}
                </p>
                {user.role && (
                  <p className="truncate text-xs text-text-subtle">
                    {user.role}
                  </p>
                )}
              </div>
            </button>
          ))}
          {hasNextPage && (
            <button
              ref={loadMoreRef}
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-3 py-2 text-center text-xs text-text-subtle transition-colors hover:text-text-default disabled:opacity-50"
            >
              {isFetchingNextPage ? "Loading..." : "Load more"}
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
