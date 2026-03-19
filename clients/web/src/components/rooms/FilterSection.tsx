import { FilterChip } from "@/components/rooms/FilterChip";

type FilterSectionProps = {
  title: string;
  chips: Array<string>;
  selectedChips: Set<string>;
  onToggle: (chip: string) => void;
};

export function FilterSection({
  title,
  chips,
  selectedChips,
  onToggle,
}: FilterSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-text-subtle">{title}</span>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <FilterChip
            key={chip}
            label={chip}
            isSelected={selectedChips.has(chip)}
            onToggle={() => onToggle(chip)}
            className="h-8"
          />
        ))}
      </div>
    </div>
  );
}
