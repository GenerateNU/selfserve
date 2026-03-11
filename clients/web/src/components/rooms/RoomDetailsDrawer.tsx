import { DiamondIcon, X } from 'lucide-react'
import { TaskCard } from './TaskCard'
import type { Room } from '@/components/rooms/RoomsList'

type RoomDetailsDrawerProps = {
  room: Room | null
  onClose: () => void
}

export function RoomDetailsDrawer({ room, onClose }: RoomDetailsDrawerProps) {
  if (!room) return null

  return (
    <aside className="fixed top-0 right-0 z-50 flex h-full w-full max-w-[45vw] flex-col border-l border-zinc-200 bg-white">
      <header className="flex items-center justify-between px-[2.5vw] py-[2.2vh]">
        <h2 className="text-3xl font-bold">Room {room.room_number}</h2>
        <button type="button" onClick={onClose} className="p-[0.6vw]">
          <X />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-[2.5vw] py-[2.5vh]">
        <div className="flex flex-col gap-[2.5vh]">
          <section>
            <h3 className="text-lg font-bold">Guests (2)</h3>
            <hr className="my-[1vh] border-zinc-200" />
            <div className="flex flex-col gap-[0.5vh] text-sm">
              <span>Jane Doe</span>
              <span>John Doe</span>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold">Details</h3>
            <hr className="my-[1vh] border-zinc-200" />
            <div className="flex flex-col gap-[1.5vh]">
              <div>
                <h4 className="mb-[0.5vh] text-md font-medium">Room status</h4>
                <div className="flex flex-col gap-[0.9vh]">
                  <span className="flex w-full items-center gap-[0.5vh] rounded-md px-[1.2vw] py-[1vh] text-sm bg-zinc-50">
                    <DiamondIcon className="w-[1.8vh]" /> Needs cleaning
                  </span>
                  <span className="flex w-full items-center gap-[0.5vh] rounded-md px-[1.2vw] py-[1vh] text-sm bg-zinc-50">
                    <DiamondIcon className="w-[1.8vh]" /> Late checkout approved
                  </span>
                </div>
              </div>
              <div>
                <h4 className="mb-[0.5vh] text-md font-medium">
                  Room features
                </h4>
                <div className="flex flex-wrap gap-[0.9vh]">
                  <span className="flex items-center gap-[0.4vw] rounded-md p-[0.5vh] text-sm bg-zinc-50">
                    <DiamondIcon className="h-[1.8vh] w-[1.8vh] shrink-0" />{' '}
                    Room Size: 500 sq ft
                  </span>
                  <span className="flex items-center gap-[0.4vw] rounded-md p-[0.5vh] text-sm bg-zinc-50">
                    <DiamondIcon className="h-[1.8vh] w-[1.8vh] shrink-0" />{' '}
                    Bed: queen
                  </span>
                  <span className="flex items-center gap-[0.4vw] rounded-md p-[0.5vh] text-sm bg-zinc-50">
                    <DiamondIcon className="h-[1.8vh] w-[1.8vh] shrink-0" /> Bar
                    / Lounge
                  </span>
                  <span className="flex items-center gap-[0.4vw] rounded-md p-[0.5vh] text-sm bg-zinc-50">
                    <DiamondIcon className="h-[1.8vh] w-[1.8vh] shrink-0" /> 1
                    bathroom
                  </span>
                  <span className="flex items-center gap-[0.4vw] rounded-md p-[0.5vh] text-sm bg-zinc-50">
                    <DiamondIcon className="h-[1.8vh] w-[1.8vh] shrink-0" /> 1
                    toilet
                  </span>
                </div>
              </div>
            </div>
          </section>
          <section>
            <h3 className="text-lg font-bold">Issues</h3>
            <hr className="my-[1vh] border-zinc-200" />
            <div className="flex flex-col gap-[0.5vh]">
              <h4 className="mb-[0.5vh] text-md font-medium">
                Guest Complaints
              </h4>
              <span className="text-sm font-light text-zinc-400">
                No guest complaints
              </span>
              <h4 className="mb-[0.5vh] text-md font-medium">
                Maintenance Issues
              </h4>
              <span className="text-sm font-light text-zinc-400">
                No maintenance issues
              </span>
            </div>
          </section>
          <section>
            <h3 className="text-lg font-bold">Tasks</h3>
            <hr className="my-[1vh] border-zinc-200" />
            <div className="flex flex-col gap-[0.5vh] py-[0.5vh]">
              <TaskCard task="Clean room" onAssign={() => {}} />
              <TaskCard task="Make bed" onAssign={() => {}} />
            </div>
          </section>
        </div>
      </div>
    </aside>
  )
}
