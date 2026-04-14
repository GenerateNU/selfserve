import { X } from "lucide-react";
import {
  useGetGuestsStaysId,
  useGetRequestGuestId,
  usePutGuestsId,
} from "@shared";
import { cn } from "@/lib/utils";
import { GuestProfileTab } from "./GuestProfileTab";
import { Skeleton } from "@/components/ui/skeleton";

type GuestDetailsDrawerProps = {
  guestId: string;
  activeTab: "profile" | "activity";
  onTabChange: (tab: "profile" | "activity") => void;
  onClose: () => void;
};

const TABS: { key: "profile" | "activity"; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "activity", label: "Visit Activity" },
];

export function GuestDetailsDrawer({
  guestId,
  activeTab,
  onTabChange,
  onClose,
}: GuestDetailsDrawerProps) {
  const {
    data: guest,
    isLoading,
    isError,
    refetch,
  } = useGetGuestsStaysId(guestId);
  const { data: requestsData } = useGetRequestGuestId(guestId);
  const requests = (requestsData as any)?.items ?? requestsData ?? [];
  const updateGuest = usePutGuestsId();

  const handleSaveNotes = async (notes: string) => {
    await updateGuest.mutateAsync({ id: guestId, data: { notes } });
    await refetch();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-stroke-subtle px-6 py-5">
        <div className="min-w-0">
          {isLoading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <h2 className="truncate text-lg font-semibold text-text-default">
              {guest ? `${guest.first_name} ${guest.last_name}` : "Guest"}
            </h2>
          )}
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="ml-4 shrink-0 rounded-lg p-1.5 text-text-subtle transition-colors hover:bg-bg-container hover:text-text-default"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex shrink-0 border-b border-stroke-subtle px-6"
        role="tablist"
      >
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={activeTab === key}
            onClick={() => onTabChange(key)}
            className={cn(
              "mr-6 border-b-2 py-3 text-sm font-medium transition-colors",
              activeTab === key
                ? "border-primary text-primary"
                : "border-transparent text-text-subtle hover:text-text-default",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex flex-col gap-4 p-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        )}
        {isError && (
          <div className="p-6 text-sm text-text-subtle">
            Failed to load guest details.
          </div>
        )}
        {!isLoading && !isError && guest && (
          <>
            {activeTab === "profile" && (
              <GuestProfileTab
                guest={guest}
                onSaveNotes={handleSaveNotes}
                isSavingNotes={updateGuest.isPending}
              />
            )}
            {activeTab === "activity" && (
              <div className="p-6 text-sm text-text-subtle">
                Coming soon.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
