import { FilterChip } from "@/components/rooms/FilterChip";

type FilterSectionProps = {
  title: string;
  chips: string[];
  selectedChips: Set<string>;
};

export function FilterSection({ title, chips, selectedChips }: FilterSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-gray-500">{title}</span>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <FilterChip key={chip} label={chip} isSelected={selectedChips.has(chip)} />
        ))}
      </div>
    </div>
  );
}
