import { Filter } from "@/components/ui/filters";

/** Strip everything except digits, capped at 10. */
export function parsePhoneDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

/**
 * Format a raw digit string (or already-formatted string) as (XXX) XXX-XXXX.
 * Non-phone values like "—" are returned unchanged.
 */
export function formatPhoneNumber(value: string): string {
  const d = parsePhoneDigits(value);
  if (d.length === 0) return value; // preserve placeholder like "—"
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

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
