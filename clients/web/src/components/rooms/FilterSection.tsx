import { FilterChip } from "@/components/rooms/FilterChip";

type Option<T extends string> = {
  value: T;
  label: string;
};

type FilterSectionProps<T extends string> = {
  title: string;
  options: Array<Option<T>>;
  selectedValues: Set<T>;
  onToggle: (value: T) => void;
};

export function FilterSection<T extends string>({
  title,
  options,
  selectedValues,
  onToggle,
}: FilterSectionProps<T>) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm text-text-subtle">{title}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            isSelected={selectedValues.has(option.value)}
            onToggle={() => onToggle(option.value)}
          />
        ))}
      </div>
    </div>
  );
}
