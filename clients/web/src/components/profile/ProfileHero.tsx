import { Skeleton } from "@/components/ui/skeleton";

type ProfileHeroProps = {
  firstName: string;
  lastName: string;
  avatarUrl: string | undefined;
};

export function ProfileHero({
  firstName,
  lastName,
  avatarUrl,
}: ProfileHeroProps) {
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || "User";

  return (
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
  );
}

export function ProfileHeroSkeleton() {
  return (
    <div className="flex items-center gap-11 mb-6 pl-4">
      <Skeleton className="size-30 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-4 w-24 mt-1" />
      </div>
    </div>
  );
}
