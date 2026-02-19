import type { Room } from '@/components/rooms/RoomsList'

type RoomDetailsDrawerProps = {
  room: Room | null
  onClose: () => void
}

export function RoomDetailsDrawer({ room, onClose }: RoomDetailsDrawerProps) {
  return (
    <aside
      className={`shrink-0 overflow-hidden transition-[width] duration-300 ease-out ${
        room ? 'w-80' : 'w-0'
      }`}
      aria-label="Room details"
    >
      {room && (
        <div className="h-full flex flex-col border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 p-4 border-b border-zinc-200 dark:border-zinc-700 shrink-0">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Room {room.room_number}
              </h2>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Floor {room.floor}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close room details"
              className="mt-0.5 shrink-0 rounded p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Room type
              </span>
              <span className="text-sm text-zinc-800 dark:text-zinc-200">
                {room.room_type}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Floor
              </span>
              <span className="text-sm text-zinc-800 dark:text-zinc-200">
                {room.floor}
              </span>
            </div>

            {room.tags && room.tags.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  Status
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {room.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
