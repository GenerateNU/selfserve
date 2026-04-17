import { X } from "lucide-react";
import type { View } from "@shared/types/views";

type DeleteViewModalProps = {
  view: View | null;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteViewModal({
  view,
  isPending,
  onConfirm,
  onCancel,
}: DeleteViewModalProps) {
  if (!view) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-5 top-5 text-text-secondary hover:text-text-default"
        >
          <X className="size-5" />
        </button>
        <h2 className="text-[20px] font-bold text-text-default">
          Delete {view.display_name}?
        </h2>
        <p className="mt-2 text-[16px] text-text-secondary">
          This view will be permanently deleted and cannot be recovered.
        </p>
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-stroke-subtle px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-selected hover:text-text-default transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-lg bg-danger px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
