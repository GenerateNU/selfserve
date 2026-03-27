import { Skeleton } from "@/components/ui/skeleton";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[40%_1fr] items-center py-3">
      <p className="text-sm font-medium text-text-default">{label}</p>
      <p className="text-sm text-text-subtle">{value}</p>
    </div>
  );
}

type ProfileInfoCardProps = {
  governmentName: string;
  email: string;
  phoneNumber: string;
  department: string;
};

export function ProfileInfoCard({
  governmentName,
  email,
  phoneNumber,
  department,
}: ProfileInfoCardProps) {
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

export function ProfileInfoCardSkeleton() {
  return (
    <section className="h-56 rounded-lg border border-stroke-subtle bg-white p-6">
      <div className="divide-y divide-stroke-subtle">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="grid grid-cols-[40%_1fr] items-center py-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
      </div>
    </section>
  );
}
