import { DiamondIcon } from 'lucide-react'

type TaskCardProps = {
  task: string
  onAssign: () => void
}
export function TaskCard({ task, onAssign }: TaskCardProps) {
  return (
    <div className="flex flex-col gap-[1.5vh] rounded-md border border-zinc-200 p-[1vw]">
      <div className="flex items-center gap-[0.4vw]">
        <DiamondIcon className="h-[1.8vh] w-[1.8vh] shrink-0" />
        <span className="text-md font-bold">{task}</span>
      </div>
      <button
        type="button"
        className="w-full rounded-md border border-zinc-200 bg-blue-600 py-[1vh] text-sm font-medium text-white active:bg-blue-400"
        onClick={onAssign}
      >
        Assign to self
      </button>
    </div>
  )
}
