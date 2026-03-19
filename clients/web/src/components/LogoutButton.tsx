import { useClerk } from "@clerk/clerk-react";
import { LogOut, X } from "lucide-react";
import { useState } from "react";

export function LogoutButton() {
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full hover:cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        <LogOut className="size-5 shrink-0" />
        Logout
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
            >
              <X className="size-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              Are you sure you want to log out?
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              You'll be signed out and can log back in anytime.
            </p>
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-lg bg-[#2d4a2d] px-5 py-2 text-sm font-semibold text-white hover:bg-[#243d24]"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
