import { SearchBar } from "@/components/ui/SearchBar";

type GuestSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function GuestSearchBar({ value, onChange }: GuestSearchBarProps) {
  return (
    <SearchBar value={value} onChange={onChange} placeholder="Search Guests" />
  );
}
