import { Search, X } from "lucide-react";

type FloorDropdownSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export const FloorDropdownSearch = ({
  value,
  onChange,
}: FloorDropdownSearchProps) => {
  return (
    <div className="flex items-center gap-3 border-y border-stroke-subtle px-4 py-3">
      <Search className="h-5 w-5 shrink-0 text-text-subtle" strokeWidth={2.5} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search..."
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-subtle"
      />
      {value && (
        <button type="button" onClick={() => onChange("")}>
          <X className="h-5 w-5 text-text-subtle hover:text-text-default" />
        </button>
      )}
    </div>
  );
};
