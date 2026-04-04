import type { User } from "@shared";

type UserAvatarProps = {
  user: User;
};

export function UserAvatar({ user }: UserAvatarProps) {
  const initials = [user.first_name?.[0], user.last_name?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  if (user.profile_picture) {
    return (
      <img
        src={user.profile_picture}
        alt={initials}
        className="size-7 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-bg-selected text-xs font-medium text-text-default">
      {initials || "?"}
    </div>
  );
}
