import type { Stay } from "@shared";

export function GuestBookingHistoryView(_props: {
  currentStays: Stay[];
  pastStays: Stay[];
  onBack: () => void;
}) {
  return (
    <div className="p-6">
      <button
        type="button"
        aria-label="Visit Activity"
        onClick={_props.onBack}
        className="text-sm font-medium text-primary"
      >
        ← Visit Activity
      </button>
      <p className="mt-4 text-sm text-text-subtle">history stub</p>
    </div>
  );
}
