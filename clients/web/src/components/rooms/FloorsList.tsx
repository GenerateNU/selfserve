type FloorListProps = {
  floors: Array<number>
  pending: Array<number>
  search: string
  onToggle: (floor: number) => void
}

export function FloorList({
  floors,
  pending,
  search,
  onToggle,
}: FloorListProps) {
  return (
    <div className="flex flex-col max-h-[15vh] overflow-y-auto py-[0.5vh]">
      {floors.length === 0 ? (
        <p className="px-[0.5vw] py-[0.5vh] text-sm text-gray-400 italic">
          No floors match "{search}"
        </p>
      ) : (
        floors.map((floor) => (
          <label
            key={floor}
            className="flex items-center gap-[0.5vw] px-[1.15vw] py-[0.7vh] text-sm cursor-pointer hover:bg-gray-200 rounded"
          >
            <input
              type="checkbox"
              checked={pending.includes(floor)}
              onChange={() => onToggle(floor)}
              className="accent-black "
            />
            Floor {floor}
          </label>
        ))
      )}
    </div>
  )
}
