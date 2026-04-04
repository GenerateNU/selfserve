import { Filter } from "@/components/ui/filters";

const toFilterConfig = <T extends number | string>(
  options: T[],
  selected: T[],
  onChange: (v: T) => void,
  placeholder: string,
  toLabel: (v: T) => string,
): Filter<T>[] => [
  {
    value: selected,
    onChange,
    placeholder,
    options: options.map((v) => ({ label: toLabel(v), value: v })),
  },
];

export const getFloorConfig = (
  floors: number[],
  selected: number[],
  onChange: (f: number) => void,
) => toFilterConfig(floors, selected, onChange, "Floor", (n) => `Floor ${n}`);

export const getGroupSizeConfig = (
  sizes: number[],
  selected: number[],
  onChange: (s: number) => void,
) =>
  toFilterConfig(sizes, selected, onChange, "Group Size", (n) => `${n} guests`);
