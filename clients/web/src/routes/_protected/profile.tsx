import { createFileRoute } from "@tanstack/react-router";
import { useUser } from "@clerk/clerk-react";
import { useGetUsersIdHook } from "@shared/api/generated/endpoints/users/users.ts";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileHero, ProfileHeroSkeleton } from "@/components/profile/ProfileHero";
import { ProfileInfoCard, ProfileInfoCardSkeleton } from "@/components/profile/ProfileInfoCard";
import { NotesFromManagerCard } from "@/components/profile/NotesFromManagerCard";

export const Route = createFileRoute("/_protected/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user: clerkUser } = useUser();
  const getUsersId = useGetUsersIdHook();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", clerkUser?.id],
    queryFn: () => getUsersId(clerkUser!.id),
    enabled: !!clerkUser?.id,
  });

  const firstName = user?.first_name ?? "";
  const lastName = user?.last_name ?? "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || "User";
  const avatarUrl = user?.profile_picture || clerkUser?.imageUrl;

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <header className="flex-row gap-1.5 border-b border-stroke-subtle px-10 py-5">
        <h1 className="text-2xl font-semibold text-text-default">Profile</h1>
        <p className="text-sm font-medium text-text-subtle">
          Overview of profile
        </p>
      </header>

      <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
        {isLoading ? (
          <>
            <ProfileHeroSkeleton />
            <div className="flex flex-1 gap-4">
              <div className="flex-1">
                <ProfileInfoCardSkeleton />
              </div>
              <div className="flex-1">
                <Skeleton className="h-56 rounded-lg" />
              </div>
            </div>
          </>
        ) : (
          <>
            <ProfileHero
              firstName={firstName}
              lastName={lastName}
              avatarUrl={avatarUrl}
            />
            <div className="flex flex-1 gap-4">
              <div className="flex-1">
                <ProfileInfoCard
                  governmentName={displayName}
                  email={user?.primary_email ?? "—"}
                  phoneNumber={user?.phone_number ?? "—"}
                  department={user?.department ?? "—"}
                />
              </div>
              <div className="flex-1">
                <NotesFromManagerCard />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
