import { useUser } from "@clerk/clerk-react";
import { useGetUsersIdHook } from "@shared";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users } from "lucide-react";
import { useProfilePicture } from "@/hooks/use-profile-picture";
import { cn } from "@/lib/utils";

export type SettingsTab = "profile" | "members" | "departments";

type SettingsNavProps = {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
};

export function SettingsNav({ activeTab, onTabChange }: SettingsNavProps) {
  const { user } = useUser();
  const getUsersId = useGetUsersIdHook();
  const { profilePicUrl } = useProfilePicture(user?.id ?? "");
  const { data: appUser } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: () => getUsersId(user!.id),
    enabled: !!user?.id,
  });

  const displayName =
    user?.fullName ??
    [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const avatarUrl = profilePicUrl ?? appUser?.profile_picture ?? user?.imageUrl;
  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  return (
    <div className="w-64 shrink-0 overflow-y-auto border-r border-stroke-subtle p-4">
      <p className="px-2 pb-1 pt-2 text-xs font-medium text-text-secondary">
        Account
      </p>

      <button
        type="button"
        onClick={() => onTabChange("profile")}
        className={cn(
          "mb-0.5 flex w-full items-center gap-2.5 rounded-md px-2 py-1.5",
          activeTab === "profile" && "bg-bg-selected",
        )}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName || "User"}
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
      </button>

      <p className="px-2 pb-1 pt-4 text-xs font-medium text-text-secondary">
        Workspace
      </p>

      <button
        type="button"
        onClick={() => onTabChange("members")}
        className={cn(
          "mb-0.5 flex w-full items-center gap-2.5 rounded-md px-2 py-1.5",
          activeTab === "members" && "bg-bg-selected",
        )}
      >
        <Users className="size-4 shrink-0 text-text-subtle" />
        <span className="text-sm text-text-default">Members</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange("departments")}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5",
          activeTab === "departments" && "bg-bg-selected",
        )}
      >
        <Building2 className="size-4 shrink-0 text-text-subtle" />
        <span className="text-sm text-text-default">Departments</span>
      </button>
    </div>
  );
}
