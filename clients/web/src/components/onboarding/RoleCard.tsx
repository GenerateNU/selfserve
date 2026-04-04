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
      className={`p-4 rounded-xl border-2 text-left transition-colors w-full bg-white
        ${selected ? "border-[var(--color-primary)]" : "border-gray-200 hover:border-gray-300"}`}
    >
      <p className="text-[clamp(12px,1.2vw,16px)] font-medium text-gray-900 m-0">
        {label}
      </p>
      <p className="text-[clamp(10px,1vw,14px)] text-gray-500 mt-1 m-0">
        {description}
      </p>
    </button>
  );
}
