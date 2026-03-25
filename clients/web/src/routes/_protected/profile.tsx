import { createFileRoute } from "@tanstack/react-router";
import { useUser } from "@clerk/clerk-react";

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
  displayName,
  email,
  phone,
}: {
  displayName: string;
  email: string;
  phone: string;
}) {
  return (
    <section className="h-56 rounded-lg border border-stroke-subtle bg-white p-6">
      <div className="divide-y divide-stroke-subtle">
        <DetailRow label="Government Name" value={displayName} />
        <DetailRow label="Date of Birth" value="—" />
        <DetailRow label="Phone" value={phone || "—"} />
        <DetailRow label="Email" value={email || "—"} />
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
  const { user } = useUser();

  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "User";

  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const phone = user?.primaryPhoneNumber?.phoneNumber ?? "";

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
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={displayName}
              className="size-30 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-30 items-center justify-center rounded-full border-2 border-text-default bg-gray-100">
              <span className="text-[40px] font-semibold text-text-default">
                {displayName.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-[40px] font-bold text-text-default leading-none">
              {user?.firstName}
            </h2>
            <h2 className="text-[40px] font-bold text-text-default leading-none">
              {user?.lastName}
            </h2>
            <p className="pt-1 text-base font-bold text-primary">Hotel Chain</p>
          </div>
        </div>

        {/* Info + Notes row */}
        <div className="flex flex-1 gap-4">
          <div className="flex-1">
            <ProfileInfoCard
              displayName={displayName}
              email={email}
              phone={phone}
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
