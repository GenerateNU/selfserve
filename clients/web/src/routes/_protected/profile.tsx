import { createFileRoute } from "@tanstack/react-router";
import { useUser } from "@clerk/clerk-react";
import { useGetUsersIdHook } from "@shared/api/generated/endpoints/users/users.ts";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_protected/profile")({
  component: ProfilePage,
});

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[40%_1fr] items-center py-3">
      <p className="text-sm font-medium text-text-default">{label}</p>
      <p className="text-sm text-text-subtle">{value}</p>
    </div>
  );
}

function ProfileInfoCard({
  governmentName,
  email,
  phoneNumber,
  department,
}: {
  governmentName: string;
  email: string;
  phoneNumber: string;
  department: string;
}) {
  return (
    <section className="h-56 rounded-lg border border-stroke-subtle bg-white p-6">
      <div className="divide-y divide-stroke-subtle">
        <DetailRow label="Government Name" value={governmentName} />
        <DetailRow label="Email" value={email} />
        <DetailRow label="Phone Number" value={phoneNumber} />
        <DetailRow label="Department" value={department} />
      </div>
    </section>
  );
}

function NotesFromManagerCard() {
  return (
    <section className="h-56 rounded-lg border border-stroke-subtle bg-white p-6">
      <h2 className="text-sm font-medium text-text-default">
        Notes from Manager
      </h2>
    </section>
  );
}

function ProfilePage() {
  const { user: clerkUser } = useUser();
  const getUsersId = useGetUsersIdHook();

  const { data: user } = useQuery({
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
      {/* Page header */}
      <header className="flex-row gap-1.5 border-b border-stroke-subtle px-10 py-5">
        <h1 className="text-2xl font-semibold text-text-default">Profile</h1>
        <p className="text-sm font-medium text-text-subtle">
          Overview of profile
        </p>
      </header>

      {/* Scrollable content */}
      <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
        {/* User hero */}
        <div className="flex items-center gap-11 mb-6 pl-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="size-30 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-30 items-center justify-center rounded-full border-2 border-text-default bg-background">
              <span className="text-[40px] font-semibold text-text-default">
                {displayName.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-[40px] font-bold text-text-default leading-none">
              {firstName}
            </h2>
            <h2 className="text-[40px] font-bold text-text-default leading-none">
              {lastName}
            </h2>
            <p className="pt-1 text-base font-bold text-primary">Hotel Chain</p>
          </div>
        </div>

        {/* Info + Notes row */}
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
      </div>
    </main>
  );
}
