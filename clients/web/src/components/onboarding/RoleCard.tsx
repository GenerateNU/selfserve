interface RoleCardProps {
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

export default function RoleCard({
  label,
  description,
  selected,
  onSelect,
}: RoleCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`p-4 rounded-xl border-2 text-left transition-colors w-full
        ${
          selected
            ? "border-green-900 bg-green-50"
            : "border-gray-200 hover:border-gray-300 bg-white"
        }`}
    >
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </button>
  );
}
