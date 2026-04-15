import { Skeleton } from "@/components/ui/skeleton";
import { cn, hashNameToColor } from "@/lib/utils";
import { Camera, Loader2 } from "lucide-react";
import { useRef } from "react";

type ProfileHeroProps = {
  firstName: string;
  lastName: string;
  avatarUrl: string | undefined;
  onPickFile?: (file: File) => void;
  isUploading?: boolean;
};

export function ProfileHero({
  firstName,
  lastName,
  avatarUrl,
  onPickFile,
  isUploading = false,
}: ProfileHeroProps) {
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || "User";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInteractive = !!onPickFile;

  return (
    <div className="flex items-center gap-11 mb-6 pl-4">
      <div
        className={cn(
          "group relative size-30 overflow-hidden rounded-full",
          isInteractive ? "cursor-pointer" : "",
        )}
        onClick={() => {
          if (isInteractive) {
            fileInputRef.current?.click();
          }
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="size-full object-cover"
          />
        ) : (
          <div
            className={cn(
              "flex size-full items-center justify-center",
              hashNameToColor(displayName),
            )}
          >
            <span className="text-[40px] font-semibold">
              {displayName.charAt(0)}
            </span>
          </div>
        )}

        {isInteractive && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity",
              isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            )}
          >
            {isUploading ? (
              <Loader2 className="size-6 animate-spin text-white" />
            ) : (
              <Camera className="size-6 text-white" />
            )}
          </div>
        )}

        {isInteractive && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onPickFile?.(file);
              }
              event.target.value = "";
            }}
          />
        )}
      </div>

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
