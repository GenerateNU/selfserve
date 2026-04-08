import { X } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useGetUsersIdHook } from "@shared/api/generated/endpoints/users/users.ts";
import { SettingsNav } from "./SettingsNav";
import { DialogTitle } from "@/components/ui/dialog";
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

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SettingsModal({ open, onClose }: SettingsModalProps) {
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
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-300 ease-out" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 flex h-[90vh] w-[90vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-white shadow-2xl outline-none duration-300 ease-out data-open:animate-in data-open:fade-in-0 data-open:zoom-in-90 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-90">
          <SettingsNav />

          {/* Right content panel */}
          <div className="relative flex-1 overflow-y-auto p-12">
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-md p-1.5 text-text-subtle hover:bg-bg-selected hover:text-text-default"
            >
              <X className="size-4" />
            </button>

            <div className="mb-8">
              <DialogTitle className="text-3xl font-bold text-text-default">
                {displayName}
              </DialogTitle>
            </div>

            {isLoading ? (
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
            ) : (
              <>
                <ProfileHero
                  firstName={firstName}
                  lastName={lastName}
                  avatarUrl={avatarUrl}
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
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
