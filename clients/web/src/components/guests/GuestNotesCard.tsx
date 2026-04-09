type GuestNotesCardProps = {
  notes?: string;
  draft: string;
  isEditing: boolean;
  isSaving?: boolean;
  errorMessage?: string | null;
  onDraftChange: (nextNotes: string) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => Promise<void> | void;
};

export function GuestNotesCard({
  notes = "",
  draft,
  isEditing,
  isSaving = false,
  errorMessage = null,
  onDraftChange,
  onEdit,
  onCancel,
  onSave,
}: GuestNotesCardProps) {
  return (
    <section className="border border-black bg-white px-[1vw] py-[2vh]">
      {!isEditing ? (
        <div>
          <div className="mb-[1vh] flex items-center justify-between">
            <h2 className="text-[2vw] font-medium text-black">Notes</h2>
            <button
              type="button"
              onClick={onEdit}
              disabled={isSaving}
              className="h-[3vh] min-h-[3vh] bg-primary px-[1vw] text-[1vw] text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Edit
            </button>
          </div>
          <p className="whitespace-pre-wrap text-[1vw] leading-normal text-black">
            {notes}
          </p>
        </div>
      ) : (
        <div>
          <h2 className="mb-[1vh] text-[2vw] font-medium text-black">Notes</h2>
          <textarea
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            disabled={isSaving}
            className="min-h-[20vh] w-full resize-none bg-neutral-100 p-[1vw] text-[1vw] leading-normal text-black outline-none disabled:cursor-not-allowed disabled:opacity-70"
          />
          {errorMessage ? (
            <p className="mt-[1vh] text-[0.95vw] text-red-600">{errorMessage}</p>
          ) : null}
          <div className="mt-[2vh] flex justify-end gap-[0.9vw]">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="h-[3vh] min-h-[3vh] px-[1vw] text-[1vw] text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="h-[3vh] min-h-[3vh] bg-primary px-[1vw] text-[1vw] text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
