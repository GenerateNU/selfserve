import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Building2, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useGetUsersIdHook } from "@shared/api/generated/endpoints/users/users.ts";
import { useCustomInstance } from "@shared/api/orval-mutator";

type Department = {
  id: string;
  hotel_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

const ROW_GRID = "grid grid-cols-[1fr_5rem] items-center gap-x-4";

export function DepartmentsTab() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { user: clerkUser } = useUser();
  const getCurrentUser = useGetUsersIdHook();
  const request = useCustomInstance<Department>();
  const requestList = useCustomInstance<Department[]>();
  const requestVoid = useCustomInstance<void>();

  const { data: currentUser } = useQuery({
    queryKey: ["user", clerkUser?.id],
    queryFn: () => getCurrentUser(clerkUser!.id),
    enabled: !!clerkUser?.id,
  });

  const hotelId = currentUser?.hotel_id;

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["departments", hotelId],
    queryFn: () =>
      requestList({
        url: `/hotels/${hotelId}/departments`,
        method: "GET",
      }),
    enabled: !!hotelId,
  });

  const { mutate: createDepartment, isPending: isCreating } = useMutation({
    mutationFn: (name: string) =>
      request({
        url: `/hotels/${hotelId}/departments`,
        method: "POST",
        data: { name },
      }),
    onSuccess: () => {
      setNewName("");
      setIsAdding(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["departments", hotelId] });
    },
  });

  const { mutate: updateDepartment, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      request({
        url: `/hotels/${hotelId}/departments/${id}`,
        method: "PUT",
        data: { name },
      }),
    onSuccess: () => {
      setEditingId(null);
      setEditingName("");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["departments", hotelId] });
    },
  });

  const { mutate: deleteDepartment, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) =>
      requestVoid({
        url: `/hotels/${hotelId}/departments/${id}`,
        method: "DELETE",
      }),
    onSuccess: () => {
      setDeletingId(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["departments", hotelId] });
    },
  });

  function startEdit(dept: Department) {
    setEditingId(dept.id);
    setEditingName(dept.name);
  }

  function confirmEdit() {
    if (!editingName.trim() || !editingId || isUpdating) return;
    updateDepartment({ id: editingId, name: editingName.trim() });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
  }

  function confirmAdd() {
    if (!newName.trim() || isCreating) return;
    createDepartment(newName.trim());
  }

  function cancelAdd() {
    setNewName("");
    setIsAdding(false);
  }

  const deletingDept = departments.find((d) => d.id === deletingId);

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
          <Plus className="size-4" />
          New department
        </button>
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
            className={`${ROW_GRID} border-b border-stroke-subtle bg-bg-selected px-3 py-2`}
          >
            <p className="text-xs font-medium text-text-subtle">Name</p>
            <span />
          </div>

          {/* Rows */}
          <div className="divide-y divide-stroke-subtle">
            {departments.map((dept) => (
              <div key={dept.id} className={`${ROW_GRID} px-3 py-2.5 group`}>
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
                        onClick={cancelEdit}
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

                {editingId !== dept.id && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => startEdit(dept)}
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
              <div className={`${ROW_GRID} px-3 py-2.5`}>
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
                    onClick={cancelAdd}
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
                onClick={() => deleteDepartment(deletingId)}
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
