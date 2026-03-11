import { useState } from 'react'

type GuestNotesCardProps = {
  initialNotes: string
}

export function GuestNotesCard({ initialNotes }: GuestNotesCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(initialNotes)
  const [draft, setDraft] = useState(initialNotes)

  const startEditing = () => {
    setDraft(notes)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setDraft(notes)
    setIsEditing(false)
  }

  const saveNotes = () => {
    setNotes(draft)
    setIsEditing(false)
  }

  return (
    <section className="border border-black bg-white px-[1vw] py-[2vh]">
      {!isEditing ? (
        <div>
          <div className="mb-[1vh] flex items-center justify-between">
            <h2 className="text-[2vw] font-medium text-black">Notes</h2>
            <button
              type="button"
              onClick={startEditing}
              className="h-[3vh] min-h-[3vh] bg-[#004fc5] px-[1vw] text-[1vw] text-white"
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
            onChange={(event) => setDraft(event.target.value)}
            className="min-h-[20vh] w-full resize-none bg-neutral-100 p-[1vw] text-[1vw] leading-normal text-black outline-none"
          />
          <div className="mt-[2vh] flex justify-end gap-[0.9vw]">
            <button
              type="button"
              onClick={cancelEditing}
              className="h-[3vh] min-h-[3vh] px-[1vw] text-[1vw] text-black"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveNotes}
              className="h-[3vh] min-h-[3vh] bg-[#004fc5] px-[1vw] text-[1vw] text-white"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
