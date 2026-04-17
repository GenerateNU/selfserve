import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { useGetUsersIdHook } from "@shared";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ProfileHero,
  ProfileHeroSkeleton,
} from "@/components/profile/ProfileHero";
import {
  ProfileInfoCard,
  ProfileInfoCardSkeleton,
} from "@/components/profile/ProfileInfoCard";
import { NotesFromManagerCard } from "@/components/profile/NotesFromManagerCard";
import { LogoutButton } from "@/components/LogoutButton";
import { useProfilePicture } from "@/hooks/use-profile-picture";

export function ProfileTab() {
  const { user: clerkUser } = useUser();
  const getUsersId = useGetUsersIdHook();
  const {
    profilePicUrl,
    isLoading: isProfilePictureLoading,
    handleUpload,
  } = useProfilePicture(clerkUser?.id ?? "");

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", clerkUser?.id],
    queryFn: () => getUsersId(clerkUser!.id),
    enabled: !!clerkUser?.id,
  });

  const firstName = user?.first_name ?? "";
  const lastName = user?.last_name ?? "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || "User";
  const avatarUrl =
    profilePicUrl ?? user?.profile_picture ?? clerkUser?.imageUrl;

  if (isLoading) {
    return (
      <>
        <ProfileHeroSkeleton />
        <div className="flex items-stretch gap-4">
          <div className="flex-1">
            <ProfileInfoCardSkeleton />
          </div>
          <div className="flex-1">
            <Skeleton className="h-56 rounded-lg" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ProfileHero
        firstName={firstName}
        lastName={lastName}
        avatarUrl={avatarUrl}
        onPickFile={handleUpload}
        isUploading={isProfilePictureLoading}
      />
      <div className="flex items-stretch gap-4">
        <div className="flex-1">
          <ProfileInfoCard
            userId={clerkUser!.id}
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
      <div className="mt-6">
        <LogoutButton />
      </div>
    </>
  );
}
