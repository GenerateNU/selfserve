import { useState } from "react";
import { Check, Search, X } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCustomInstance } from "@shared";
import type { User } from "@shared";
import { useDebounce } from "@/lib/utils";

type SearchUsersResponse = {
  users: Array<User>;
  next_cursor: string;
};

type AssigneeFilterMenuProps = {
  hotelId: string;
  currentUserId?: string;
  selectedUser: User | undefined;
  anchor: { x: number; y: number };
  onApply: (user: User | undefined) => void;
  onClose: () => void;
};

export function AssigneeFilterMenu({
  hotelId,
  currentUserId,
  selectedUser,
  anchor,
  onApply,
  onClose,
}: AssigneeFilterMenuProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const searchUsers = useCustomInstance<SearchUsersResponse>();
  const { data, isLoading } = useInfiniteQuery({
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
    enabled: !!hotelId,
  });

  const users = data?.pages.flatMap((p) => p.users) ?? [];

  const selectedName = selectedUser
    ? `${selectedUser.first_name ?? ""} ${selectedUser.last_name ?? ""}`.trim()
    : undefined;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 w-64 bg-white border border-stroke-subtle rounded-lg shadow-md overflow-hidden"
        style={{ left: anchor.x, top: anchor.y }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pl-4 pr-3 py-3 border-b border-stroke-subtle">
          <div className="min-w-0 flex-1">
            {selectedName && (
              <span className="inline-flex items-center gap-1 bg-bg-container rounded px-2 py-1 text-sm text-text-default">
                {selectedName}
                <button
                  type="button"
                  onClick={() => onApply(undefined)}
                  className="text-text-subtle hover:text-text-default"
                >
                  <X className="size-2" />
                </button>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onApply(undefined)}
            className="shrink-0 text-sm text-text-subtle hover:text-text-default transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-stroke-subtle">
          <Search className="size-4 shrink-0 text-text-subtle" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            autoFocus
            className="flex-1 text-sm text-text-default placeholder:text-text-subtle outline-none bg-transparent"
          />
        </div>

        {/* Users list */}
        <div className="max-h-52 overflow-y-auto">
          {isLoading && (
            <p className="px-4 py-3 text-sm text-text-subtle text-center">
              Loading...
            </p>
          )}
          {!isLoading && users.length === 0 && (
            <p className="px-4 py-3 text-sm text-text-subtle text-center">
              No staff found
            </p>
          )}
          {users.map((user) => {
            const isSelected = selectedUser?.id === user.id;
            const isCurrentUser = user.id === currentUserId;
            const name =
              `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  onApply(isSelected ? undefined : user);
                  onClose();
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-text-default hover:bg-bg-container transition-colors"
              >
                <span
                  className={`shrink-0 size-4 rounded-sm border flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "border-stroke-default bg-white"
                  }`}
                >
                  {isSelected && (
                    <Check className="size-3 text-white" strokeWidth={3} />
                  )}
                </span>
                <span>
                  {name}
                  {isCurrentUser && (
                    <span className="text-text-subtle"> (You)</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
