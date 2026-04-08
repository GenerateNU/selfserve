import { UserRound } from "lucide-react";
import { useUser } from "@clerk/clerk-react";

export function SettingsNav() {
  const { user } = useUser();

  const displayName =
    user?.fullName ??
    [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  return (
    <div className="w-64 shrink-0 overflow-y-auto border-r border-stroke-subtle p-4">
      <p className="px-2 pb-1 pt-2 text-xs font-medium text-text-secondary">
        Account
      </p>

      {/* User identity row */}
      <div className="mb-0.5 flex items-center gap-2.5 rounded-md px-2 py-1.5">
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={displayName}
            className="size-6 rounded-sm object-cover"
          />
        ) : (
          <div className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-primary text-xs font-semibold text-white">
            {initials || "?"}
          </div>
        )}
        <span className="truncate text-sm text-text-default">
          {displayName || "User"}
        </span>
      </div>

      {/* Profile tab */}
      <button
        type="button"
        onClick={() => {}}
        className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors bg-bg-selected font-medium text-text-default"
      >
        <UserRound className="size-4 shrink-0 text-text-subtle" />
        My profile
      </button>
    </div>
  );
}
