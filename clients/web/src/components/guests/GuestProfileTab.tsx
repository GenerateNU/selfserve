import { useState } from "react";
import type { GuestWithStays } from "@shared";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type GuestProfileTabProps = {
  guest: GuestWithStays;
  onSaveNotes: (notes: string) => Promise<void>;
  isSavingNotes: boolean;
};

function AssistanceChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-danger/30 bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger">
      {label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-40 shrink-0 text-sm text-text-subtle">{label}</span>
      <span className="text-sm text-text-default">{value}</span>
    </div>
  );
}

export function GuestProfileTab({
  guest,
  onSaveNotes,
  isSavingNotes,
}: GuestProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftNotes, setDraftNotes] = useState(guest.notes ?? "");

  const dndWindow =
    guest.do_not_disturb_start && guest.do_not_disturb_end
      ? `${guest.do_not_disturb_start} \u2013 ${guest.do_not_disturb_end}`
      : "\u2014";

  const allAssistance = [
    ...(guest.assistance?.accessibility ?? []),
    ...(guest.assistance?.dietary ?? []),
    ...(guest.assistance?.medical ?? []),
  ];

  const handleEdit = () => {
    setDraftNotes(guest.notes ?? "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDraftNotes(guest.notes ?? "");
  };

  const handleSave = async () => {
    await onSaveNotes(draftNotes);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Vital Information */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-text-subtle">
          Vital Information
        </h3>
        <div className="flex flex-col gap-3">
          <InfoRow
            label="Government Name"
            value={`${guest.first_name} ${guest.last_name}`}
          />
          <InfoRow label="Pronouns" value={guest.pronouns ?? "\u2014"} />
          <InfoRow label="Do Not Disturb" value={dndWindow} />
          <InfoRow
            label="Housekeeping"
            value={guest.housekeeping_cadence ?? "\u2014"}
          />
        </div>
      </section>

      <div className="border-t border-stroke-subtle" />

      {/* Specific Assistance */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-text-subtle">
          Specific Assistance
        </h3>
        {allAssistance.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {allAssistance.map((item) => (
              <AssistanceChip key={item} label={item} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-subtle">No assistance needs recorded.</p>
        )}
      </section>

      <div className="border-t border-stroke-subtle" />

      {/* Notes */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-subtle">
            Notes
          </h3>
          {!isEditing && (
            <button
              type="button"
              aria-label="Edit notes"
              onClick={handleEdit}
              className="text-sm font-medium text-primary hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-3">
            <textarea
              value={draftNotes}
              onChange={(e) => setDraftNotes(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-lg border border-stroke-subtle px-3 py-2.5 text-sm text-text-default placeholder:text-text-subtle focus:border-primary focus:outline-none"
              placeholder="Add notes about this guest…"
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSavingNotes}
              >
                {isSavingNotes ? "Saving\u2026" : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <p
            className={cn(
              "text-sm",
              guest.notes ? "text-text-default" : "text-text-subtle",
            )}
          >
            {guest.notes ?? "No notes yet."}
          </p>
        )}
      </section>
    </div>
  );
}
