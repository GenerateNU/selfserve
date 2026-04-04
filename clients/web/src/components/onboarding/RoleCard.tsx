type RoleCardProps = {
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
};

export function RoleCard({
  label,
  description,
  selected,
  onSelect,
}: RoleCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`p-4 rounded-xl border-2 text-left transition-colors w-full bg-[var(--color-bg-primary)]
        ${selected ? "border-[var(--color-primary)]" : "border-[var(--color-stroke-subtle)] hover:border-[var(--color-stroke-default)]"}`}
    >
      <p className="text-[clamp(0.75rem,1.2vw,1rem)] font-medium text-[var(--color-text-default)] m-0">
        {label}
      </p>
      <p className="text-[clamp(0.625rem,1vw,0.875rem)] text-[var(--color-text-subtle)] mt-1 m-0">
        {description}
      </p>
    </button>
  );
}
