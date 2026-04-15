import { useState } from "react";
import { X } from "lucide-react";
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
    <span className="inline-flex items-center gap-1 rounded border border-[#a21313] bg-[#ffeded] px-2 py-1 text-xs text-[#a21313]">
      {label}
      <X className="size-3.5 text-[#a21313]" strokeWidth={2} />
    </span>
  );
}

function AssistanceCategory({
  title,
  items,
}: {
  title: string;
  items: Array<string>;
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-text-secondary">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <AssistanceChip key={item} label={item} />
        ))}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-6">
      <span className="w-40 shrink-0 text-base font-medium text-text-default whitespace-nowrap">
        {label}
      </span>
      <span className="text-base text-text-default">{value}</span>
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
      ? `${guest.do_not_disturb_start} - ${guest.do_not_disturb_end}`
      : "\u2014";

  const accessibility = guest.assistance?.accessibility ?? [];
  const dietary = guest.assistance?.dietary ?? [];
  const medical = guest.assistance?.medical ?? [];
  const hasAssistance =
    accessibility.length > 0 || dietary.length > 0 || medical.length > 0;

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
    <div className="flex flex-col gap-8 p-6">
      {/* Vital Information */}
      <section className="flex flex-col gap-4 border-b border-stroke-subtle pb-6">
        <div className="flex flex-col gap-4">
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

      {/* Specific Assistance */}
      <section className="flex flex-col gap-4">
        <h3 className="text-base font-medium text-text-default">
          Specific Assistance
        </h3>
        {hasAssistance ? (
          <div className="flex flex-col gap-2 rounded border border-stroke-subtle p-4">
            <AssistanceCategory title="Accessibility" items={accessibility} />
            <AssistanceCategory title="Dietary Restrictions" items={dietary} />
            <AssistanceCategory title="Medical Needs" items={medical} />
          </div>
        ) : (
          <p className="text-sm text-text-subtle">
            No assistance needs recorded.
          </p>
        )}
      </section>

      {/* Notes */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-text-default">Notes</h3>
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
          <div className="flex flex-col gap-2">
            <textarea
              value={draftNotes}
              onChange={(e) => setDraftNotes(e.target.value)}
              rows={8}
              className="w-full resize-none rounded-lg border border-primary p-4 text-base text-text-default placeholder:text-text-subtle focus:outline-none"
              placeholder="Add notes about this guest\u2026"
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
          <div
            className={cn(
              "rounded-lg border border-stroke-subtle p-4 text-base",
              guest.notes ? "text-text-default" : "text-text-subtle",
            )}
          >
            {guest.notes ?? "No notes yet."}
          </div>
        )}
      </section>
    </div>
  );
}
