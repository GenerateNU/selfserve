import { ChevronDown, LayoutGrid, User } from "lucide-react";
import { useRef, useState } from "react";
import { FilterSortMenu } from "./FilterSortMenu";
import { AssigneeFilterMenu } from "./AssigneeFilterMenu";
import { DepartmentFilterMenu } from "./DepartmentFilterMenu";
import { PriorityFilterMenu } from "./PriorityFilterMenu";
import type { RequestFeedSort } from "@shared/api/requests";
import type { User as UserModel } from "@shared";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Priority", value: "priority" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

type HomeFilterBarProps = {
  sort?: RequestFeedSort;
  onSortChange?: (sort: RequestFeedSort | undefined) => void;
  selectedUser?: UserModel;
  onUserChange?: (user: UserModel | undefined) => void;
  selectedPriorities?: Array<string>;
  onPrioritiesChange?: (priorities: Array<string>) => void;
  selectedDepartments?: Array<string>;
  onDepartmentsChange?: (departments: Array<string>) => void;
  hotelId?: string;
  currentUserId?: string;
};

const SORT_LABELS: Record<RequestFeedSort, string> = {
  priority: "Priority",
  newest: "Newest",
  oldest: "Oldest",
};

type FilterChipProps = {
  label: string;
  active?: boolean;
  activeValue?: string;
  icon?: "grid" | "user";
  onClick?: () => void;
  ref?: React.Ref<HTMLButtonElement>;
};

function FilterChip({
  label,
  active,
  activeValue,
  icon = "grid",
  onClick,
  ref,
}: FilterChipProps) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
        active
          ? "bg-[#edf5f1] border-primary text-primary"
          : "bg-white border-stroke-default text-text-secondary hover:bg-bg-container",
      )}
    >
      {icon === "user" ? (
        <User className="size-[13px]" />
      ) : (
        <LayoutGrid className="size-[13px]" />
      )}
      <span>
        {active && activeValue ? (
          <>
            {label}: <span className="font-bold">{activeValue}</span>
          </>
        ) : (
          label
        )}
      </span>
      <ChevronDown className="size-[11px]" />
    </button>
  );
}

export function HomeFilterBar({
  sort,
  onSortChange,
  selectedUser,
  onUserChange,
  selectedPriorities = [],
  onPrioritiesChange,
  selectedDepartments = [],
  onDepartmentsChange,
  hotelId,
  currentUserId,
}: HomeFilterBarProps) {
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [assigneeMenuOpen, setAssigneeMenuOpen] = useState(false);
  const [priorityMenuOpen, setPriorityMenuOpen] = useState(false);
  const [departmentMenuOpen, setDepartmentMenuOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const assigneeButtonRef = useRef<HTMLButtonElement>(null);
  const priorityButtonRef = useRef<HTMLButtonElement>(null);
  const departmentButtonRef = useRef<HTMLButtonElement>(null);

  function openSortMenu() {
    if (sortButtonRef.current) {
      const rect = sortButtonRef.current.getBoundingClientRect();
      setMenuAnchor({ x: rect.left, y: rect.bottom + 6 });
    }
    setSortMenuOpen(true);
  }

  function openAssigneeMenu() {
    if (!hotelId) return;
    if (assigneeButtonRef.current) {
      const rect = assigneeButtonRef.current.getBoundingClientRect();
      setMenuAnchor({ x: rect.left, y: rect.bottom + 6 });
    }
    setAssigneeMenuOpen(true);
  }

  function openPriorityMenu() {
    if (priorityButtonRef.current) {
      const rect = priorityButtonRef.current.getBoundingClientRect();
      setMenuAnchor({ x: rect.left, y: rect.bottom + 6 });
    }
    setPriorityMenuOpen(true);
  }

  function openDepartmentMenu() {
    if (!hotelId) return;
    if (departmentButtonRef.current) {
      const rect = departmentButtonRef.current.getBoundingClientRect();
      setMenuAnchor({ x: rect.left, y: rect.bottom + 6 });
    }
    setDepartmentMenuOpen(true);
  }

  const activeSortLabel = sort ? SORT_LABELS[sort] : undefined;
  const activeAssigneeName = selectedUser
    ? `${selectedUser.first_name ?? ""} ${selectedUser.last_name ?? ""}`.trim()
    : undefined;
  const activePriorityLabel =
    selectedPriorities.length === 1
      ? selectedPriorities[0].charAt(0).toUpperCase() +
        selectedPriorities[0].slice(1)
      : selectedPriorities.length > 1
        ? `${selectedPriorities.length} priorities`
        : undefined;
  const activeDepartmentLabel =
    selectedDepartments.length === 1
      ? selectedDepartments[0]
      : selectedDepartments.length > 1
        ? `${selectedDepartments.length} departments`
        : undefined;

  return (
    <>
      <div className="flex items-start justify-between px-6 py-2 border-b border-stroke-subtle">
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-0 mr-4">
          <FilterChip
            ref={sortButtonRef}
            label="Sorting"
            active={!!activeSortLabel}
            activeValue={activeSortLabel}
            onClick={openSortMenu}
          />
          <FilterChip label="Grouping" />
          <FilterChip
            ref={assigneeButtonRef}
            label="Assignee"
            active={!!activeAssigneeName}
            activeValue={activeAssigneeName}
            icon="user"
            onClick={openAssigneeMenu}
          />
          <FilterChip
            ref={departmentButtonRef}
            label="Department"
            active={selectedDepartments.length > 0}
            activeValue={activeDepartmentLabel}
            onClick={openDepartmentMenu}
          />
          <FilterChip
            ref={priorityButtonRef}
            label="Priority"
            active={selectedPriorities.length > 0}
            activeValue={activePriorityLabel}
            onClick={openPriorityMenu}
          />
          <FilterChip label="Location" />
          <FilterChip label="Deadline" />
        </div>
        <div className="flex shrink-0 items-center gap-3 pt-1">
          <button
            type="button"
            className="text-sm text-text-secondary hover:text-text-default transition-colors"
          >
            Clear All
          </button>
          <button
            type="button"
            className="rounded border border-stroke-default px-2 py-1 text-sm text-text-secondary hover:bg-bg-container transition-colors"
          >
            Save as New View
          </button>
        </div>
      </div>

      {sortMenuOpen && (
        <FilterSortMenu
          options={SORT_OPTIONS}
          selected={sort}
          anchor={menuAnchor}
          onApply={(value) =>
            onSortChange?.(value as RequestFeedSort | undefined)
          }
          onClose={() => setSortMenuOpen(false)}
        />
      )}

      {assigneeMenuOpen && hotelId && (
        <AssigneeFilterMenu
          hotelId={hotelId}
          currentUserId={currentUserId}
          selectedUser={selectedUser}
          anchor={menuAnchor}
          onApply={(user) => onUserChange?.(user)}
          onClose={() => setAssigneeMenuOpen(false)}
        />
      )}

      {priorityMenuOpen && (
        <PriorityFilterMenu
          selectedPriorities={selectedPriorities}
          anchor={menuAnchor}
          onApply={(priorities) => onPrioritiesChange?.(priorities)}
          onClose={() => setPriorityMenuOpen(false)}
        />
      )}

      {departmentMenuOpen && hotelId && (
        <DepartmentFilterMenu
          hotelId={hotelId}
          selectedNames={selectedDepartments}
          anchor={menuAnchor}
          onApply={(names) => onDepartmentsChange?.(names)}
          onClose={() => setDepartmentMenuOpen(false)}
        />
      )}
    </>
  );
}
