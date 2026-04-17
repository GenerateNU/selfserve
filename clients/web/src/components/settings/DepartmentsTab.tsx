import { useState } from "react";
import { Building2, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { useGetUsersIdHook } from "@shared/api/generated/endpoints/users/users.ts";
import {
  useCreateDepartment,
  useDeleteDepartment,
  useGetDepartments,
  useUpdateDepartment,
} from "@shared";
import { useIsAdmin } from "@/hooks/use-is-admin";

export function DepartmentsTab() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { isAdmin } = useIsAdmin();

  const { user: clerkUser } = useUser();
  const getCurrentUser = useGetUsersIdHook();

  const { data: currentUser } = useQuery({
    queryKey: ["user", clerkUser?.id],
    queryFn: () => getCurrentUser(clerkUser!.id),
    enabled: !!clerkUser?.id,
  });

  const hotelId = currentUser?.hotel_id;

  const { data, isLoading } = useGetDepartments(hotelId);
  const departments = data ?? [];
  const { mutate: createDepartment, isPending: isCreating } =
    useCreateDepartment(hotelId);
  const { mutate: updateDepartment, isPending: isUpdating } =
    useUpdateDepartment(hotelId);
  const { mutate: deleteDepartment, isPending: isDeleting } =
    useDeleteDepartment(hotelId);

  function confirmEdit() {
    if (!editingName.trim() || !editingId || isUpdating) return;
    updateDepartment(
      { id: editingId, name: editingName.trim() },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditingName("");
        },
      },
    );
  }

  function confirmAdd() {
    if (!newName.trim() || isCreating) return;
    createDepartment(newName.trim(), {
      onSuccess: () => {
        setNewName("");
        setIsAdding(false);
      },
    });
  }

  const deletingDept = departments.find((d) => d.id === deletingId);

  const rowGrid = isAdmin
    ? "grid grid-cols-[1fr_5rem] items-center gap-x-4"
    : "grid grid-cols-[1fr] items-center";

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-text-subtle">
          {departments.length} department{departments.length !== 1 ? "s" : ""}
        </p>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-text-default hover:bg-bg-selected transition-colors disabled:opacity-50"
          >
            <Plus className="size-4" />
            New department
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-text-subtle">
          Loading…
        </div>
      ) : departments.length === 0 && !isAdding ? (
        <div className="flex flex-col items-center gap-2 py-12 text-text-subtle">
          <Building2 className="size-7 opacity-40" />
          <p className="text-sm">No departments yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-stroke-subtle">
          {/* Column headers */}
          <div
            className={`${rowGrid} border-b border-stroke-subtle bg-bg-selected px-3 py-2`}
          >
            <p className="text-xs font-medium text-text-subtle">Name</p>
            {isAdmin && <span />}
          </div>

          {/* Rows */}
          <div className="divide-y divide-stroke-subtle">
            {departments.map((dept) => (
              <div key={dept.id} className={`${rowGrid} px-3 py-2.5 group`}>
                <div>
                  {editingId === dept.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") confirmEdit();
                          if (e.key === "Escape") {
                            setEditingId(null);
                            setEditingName("");
                          }
                        }}
                        autoFocus
                        className="flex-1 border-b border-stroke-default bg-transparent py-0.5 text-sm text-text-default focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={confirmEdit}
                        disabled={isUpdating}
                        className="rounded p-1.5 text-text-subtle hover:bg-bg-selected hover:text-text-default transition-colors disabled:opacity-50"
                      >
                        <Check className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditingName("");
                        }}
                        className="rounded p-1.5 text-text-subtle hover:bg-bg-selected hover:text-text-default transition-colors"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-text-default">
                      {dept.name}
                    </span>
                  )}
                </div>

                {isAdmin && editingId !== dept.id && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(dept.id);
                        setEditingName(dept.name);
                      }}
                      className="rounded p-1.5 text-text-subtle hover:bg-bg-selected hover:text-text-default transition-colors"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(dept.id)}
                      className="rounded p-1 text-danger hover:bg-bg-selected transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Inline add form */}
            {isAdding && (
              <div className={`${rowGrid} px-3 py-2.5`}>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmAdd();
                      if (e.key === "Escape") {
                        setNewName("");
                        setIsAdding(false);
                      }
                    }}
                    placeholder="Department name"
                    autoFocus
                    className="flex-1 border-b border-stroke-default bg-transparent py-0.5 text-sm text-text-default placeholder:text-text-subtle focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={confirmAdd}
                    disabled={isCreating}
                    className="rounded p-1.5 text-text-subtle hover:bg-bg-selected hover:text-text-default transition-colors disabled:opacity-50"
                  >
                    <Check className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewName("");
                      setIsAdding(false);
                    }}
                    className="rounded p-1.5 text-text-subtle hover:bg-bg-selected hover:text-text-default transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <span />
              </div>
            )}
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <button
              type="button"
              onClick={() => setDeletingId(null)}
              className="absolute right-5 top-5 text-text-secondary hover:text-text-default"
            >
              <X className="size-5" />
            </button>
            <h2 className="text-[20px] font-bold text-text-default">
              Delete {deletingDept?.name}?
            </h2>
            <p className="mt-2 text-[16px] text-text-secondary">
              This department will be permanently removed. Members won't be
              deleted.
            </p>
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="rounded-lg border border-stroke-subtle px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-selected hover:text-text-default transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  deleteDepartment(deletingId, {
                    onSuccess: () => setDeletingId(null),
                  })
                }
                disabled={isDeleting}
                className="rounded-lg bg-danger px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
