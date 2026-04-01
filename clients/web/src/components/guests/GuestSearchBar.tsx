import { Search } from "lucide-react";

type GuestSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function GuestSearchBar({ value, onChange }: GuestSearchBarProps) {
  return (
    <label className="flex h-11 w-full items-center gap-3 rounded-lg border border-stroke-subtle bg-white px-4">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search Guests"
        className="w-full bg-transparent text-sm text-text-default outline-none placeholder:text-text-subtle"
      />
      <Search className="h-4 w-4 text-text-subtle" />
    </label>
  );
}
