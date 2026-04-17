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
        className="flex items-center gap-2 rounded-lg border border-stroke-subtle px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/5 hover:border-danger/30 hover:cursor-pointer"
      >
        <LogOut className="size-4 shrink-0" />
        Log out
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 text-text-secondary hover:text-text-default"
            >
              <X className="size-5" />
            </button>
            <h2 className="text-[20px] font-bold text-text-default">
              Are you sure you want to log out?
            </h2>
            <p className="mt-2 text-[16px] text-text-secondary">
              You'll be signed out and can log back in anytime.
            </p>
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-[14px] font-medium text-text-secondary hover:text-text-default"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-lg bg-primary px-5 py-2 text-[14px] font-semibold text-white hover:bg-primary-hover"
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
