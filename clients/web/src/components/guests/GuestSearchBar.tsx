import { Search } from 'lucide-react'

type GuestSearchBarProps = {
  value: string
  onChange: (value: string) => void
}

export function GuestSearchBar({ value, onChange }: GuestSearchBarProps) {
  return (
    <label className="flex w-full items-center gap-[1vw] border border-black bg-white px-[1vw] py-[1vh]">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search Guests"
        className="w-full bg-transparent text-[1vw] text-black outline-none placeholder:text-black"
      />
      <Search className="h-[2vh] w-[2vh] text-black" />
    </label>
  )
}
