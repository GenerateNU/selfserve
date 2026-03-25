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
      className={`p-4 rounded-xl border-2 text-left transition-colors w-full
        ${selected ? "bg-white" : "border-gray-200 hover:border-gray-300 bg-white"}`}
      style={{ borderColor: selected ? "var(--color-primary)" : undefined }}
    >
      <p
        style={{ fontSize: "clamp(12px, 1.2vw, 16px)", fontWeight: 500 }}
        className="text-gray-900 m-0"
      >
        {label}
      </p>
      <p
        style={{ fontSize: "clamp(10px, 1vw, 14px)" }}
        className="text-gray-500 mt-1 m-0"
      >
        {description}
      </p>
    </button>
  );
}
