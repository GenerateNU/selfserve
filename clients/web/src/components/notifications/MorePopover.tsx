import { useMarkAllNotificationsRead } from "@shared";
import type { RefObject } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";

type MorePopoverProps = {
  onClose: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
};

export function MorePopover({ onClose, containerRef }: MorePopoverProps) {
  useClickOutside(containerRef, onClose);

  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  return (
    <div className="absolute right-0 top-8 z-10 w-52 rounded-xl bg-bg-primary px-6 py-5 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            markAllRead();
            onClose();
          }}
          className="rounded-sm border border-stroke-default bg-bg-primary px-4 py-2 text-sm text-text-secondary hover:bg-bg-container"
        >
          Mark all as read
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-sm border border-stroke-default bg-bg-primary px-4 py-2 text-sm text-text-secondary hover:bg-bg-container"
        >
          Delete all
        </button>
      </div>
    </div>
  );
}
