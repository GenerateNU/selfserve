import { OrderByDropdown } from "./OrderByDropdown";

type SortByContainerProps = {
  ascending: boolean;
  setAscending: (ascending: boolean) => void;
};

export function SortByContainer({
  ascending,
  setAscending,
}: SortByContainerProps) {
  return (
    <span className="text-sm text-text-subtle flex items-center gap-1 pt-6">
      Sort by:{" "}
      <OrderByDropdown ascending={ascending} setAscending={setAscending} />
    </span>
  );
}
