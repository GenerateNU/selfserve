import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

type Department = {
  id: string;
  name: string;
  memberCount: number;
};

const PLACEHOLDER_DEPARTMENTS: Department[] = [
  { id: "1", name: "Front Desk", memberCount: 5 },
  { id: "2", name: "Housekeeping", memberCount: 12 },
  { id: "3", name: "Maintenance", memberCount: 8 },
  { id: "4", name: "Food & Beverage", memberCount: 15 },
];

const ROW_GRID = "grid grid-cols-[1fr_8rem_5rem] items-center gap-x-4";

export function DepartmentsTab() {
  const [departments, setDepartments] = useState<Department[]>(
    PLACEHOLDER_DEPARTMENTS,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  function startEdit(dept: Department) {
    setEditingId(dept.id);
    setEditingName(dept.name);
  }

  function confirmEdit() {
    if (!editingName.trim() || !editingId) return;
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === editingId ? { ...d, name: editingName.trim() } : d,
      ),
    );
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
  }

  function deleteDepartment(id: string) {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  }

  function confirmAdd() {
    if (!newName.trim()) return;
    setDepartments((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: newName.trim(), memberCount: 0 },
    ]);
    setNewName("");
    setIsAdding(false);
  }

  function cancelAdd() {
    setNewName("");
    setIsAdding(false);
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-text-subtle">
          {departments.length} department{departments.length !== 1 ? "s" : ""}
        </p>
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-text-default hover:bg-bg-selected transition-colors disabled:opacity-50"
        >
          <Plus className="size-3.5" />
          New department
        </button>
      </div>

      {/* Column headers */}
      <div
        className={`${ROW_GRID} border-b border-stroke-subtle pb-1.5`}
      >
        <p className="text-xs font-medium text-text-subtle">Name</p>
        <p className="text-xs font-medium text-text-subtle">Members</p>
        <span />
      </div>

      {/* Rows */}
      <div className="pt-1">
        {departments.map((dept) => (
          <div key={dept.id} className={`${ROW_GRID} py-2 group`}>
            <div>
              {editingId === dept.id ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    autoFocus
                    className="flex-1 rounded-md border border-stroke-default bg-transparent px-2 py-1 text-sm text-text-default focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={confirmEdit}
                    className="rounded p-1 text-text-subtle hover:bg-bg-selected hover:text-text-default transition-colors"
                  >
                    <Check className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded p-1 text-text-subtle hover:bg-bg-selected hover:text-text-default transition-colors"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <span className="text-sm text-text-default">{dept.name}</span>
              )}
            </div>

            <span className="text-xs text-text-subtle">{dept.memberCount}</span>

            {editingId !== dept.id && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => startEdit(dept)}
                  className="rounded p-1 text-text-subtle hover:bg-bg-selected hover:text-text-default transition-colors"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteDepartment(dept.id)}
                  className="rounded p-1 text-danger hover:bg-bg-selected transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Inline add form */}
        {isAdding && (
          <div className={`${ROW_GRID} py-2`}>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmAdd();
                  if (e.key === "Escape") cancelAdd();
                }}
                placeholder="Department name"
                autoFocus
                className="flex-1 rounded-md border border-stroke-default bg-transparent px-2 py-1 text-sm text-text-default placeholder:text-text-subtle focus:outline-none"
              />
              <button
                type="button"
                onClick={confirmAdd}
                className="rounded p-1 text-text-subtle hover:bg-bg-selected hover:text-text-default transition-colors"
              >
                <Check className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={cancelAdd}
                className="rounded p-1 text-text-subtle hover:bg-bg-selected hover:text-text-default transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <span />
            <span />
          </div>
        )}

        {departments.length === 0 && !isAdding && (
          <p className="py-10 text-center text-sm text-text-subtle">
            No departments yet. Add one to get started.
          </p>
        )}
      </div>
    </div>
  );
}
