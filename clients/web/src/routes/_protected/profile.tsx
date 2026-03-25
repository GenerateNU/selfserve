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
    <section className="rounded-xl border border-stroke-subtle bg-white p-6">
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
    <section className="rounded-xl border border-stroke-subtle bg-white p-6">
      <h2 className="text-sm font-medium text-text-default">
        Notes from Manager
      </h2>
    </section>
  );
}

function ProfilePage() {
  const { user } = useUser();

  const displayName =
    user?.fullName ??
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ??
    "User";

  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const phone = user?.primaryPhoneNumber?.phoneNumber ?? "";

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      {/* Page header */}
      <header className="flex-row gap-1.5 border-b border-stroke-subtle px-6 py-5">
        <h1 className="text-2xl font-semibold text-text-default">Profile</h1>
        <p className="text-sm font-medium text-text-subtle">
          Overview of profile, hours, etc.
        </p>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="flex max-w-5xl flex-col gap-6">
          {/* User hero */}
          <div className="flex items-center gap-5">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={displayName}
                className="size-20 rounded-full border-2 border-text-default object-cover"
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-full border-2 border-text-default bg-gray-100">
                <span className="text-2xl font-semibold text-text-default">
                  {displayName.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-3xl font-bold text-text-default">
                {displayName}
              </h2>
              <p className="mt-1 text-sm font-medium text-primary">
                Hotel Chain
              </p>
            </div>
          </div>

          {/* Info + Notes row */}
          <div className="grid grid-cols-2 gap-4">
            <ProfileInfoCard
              displayName={displayName}
              email={email}
              phone={phone}
            />
            <NotesFromManagerCard />
          </div>
        </div>
      </div>
    </main>
  );
}
