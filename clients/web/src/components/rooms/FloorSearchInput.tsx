import { Search, X } from "lucide-react";

type FloorSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export const FloorSearchInput = ({
  value,
  onChange,
}: FloorSearchInputProps) => {
  return (
    <div className="flex items-center gap-[0.5vw] border-b border-gray-300 px-[1vw] py-[1vh]">
      <Search
        className="h-[2vh] w-[2vh] shrink-0 text-gray-500"
        strokeWidth={2}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search..."
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500"
      />
      {value && (
        <button type="button" onClick={() => onChange("")}>
          <X className="h-[1.75vh] w-[1.75vh] text-gray-500 hover:text-gray-600" />
        </button>
      )}
    </div>
  );
};
