import { X } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { SettingsNav } from "./SettingsNav";
import { DialogTitle } from "@/components/ui/dialog";

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { user } = useUser();

  const displayName =
    user?.fullName ??
    [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

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
                My profile
              </DialogTitle>
            </div>

            <div className="flex items-center gap-4">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={displayName}
                  className="size-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-bg-selected text-2xl font-semibold text-text-default">
                  {initials || "?"}
                </div>
              )}
              <p className="text-lg font-semibold text-text-default">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
