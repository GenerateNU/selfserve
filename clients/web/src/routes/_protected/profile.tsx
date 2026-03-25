import { createFileRoute } from "@tanstack/react-router";
import { useUser } from "@clerk/clerk-react";
import { GuestPageShell } from "@/components/guests/GuestPageShell";

export const Route = createFileRoute("/_protected/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useUser();

  const displayName =
    user?.fullName ??
    [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return (
    <GuestPageShell title="Profile">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {displayName || "User"}
            </p>
            <p className="text-sm text-gray-500">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
      </div>
    </GuestPageShell>
  );
}
