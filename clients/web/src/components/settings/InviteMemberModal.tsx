import { useState } from "react";
import { Mail } from "lucide-react";
import { useOrganization } from "@clerk/clerk-react";
import { isClerkAPIResponseError } from "@clerk/shared/error";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";

type InviteMemberModalProps = {
  open: boolean;
  onClose: () => void;
};

export function InviteMemberModal({ open, onClose }: InviteMemberModalProps) {
  const { organization } = useOrganization();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleOpenChange(open: boolean) {
    if (!open) handleClose();
  }

  function handleClose() {
    setEmail("");
    setError(null);
    setSuccess(false);
    onClose();
  }

  async function handleSubmit() {
    if (!organization || !email) return;

    setError(null);
    setIsLoading(true);

    try {
      await organization.inviteMember({
        emailAddress: email,
        role: "org:member",
      });
      setSuccess(true);
      setEmail("");
    } catch (err: unknown) {
      if (isClerkAPIResponseError(err)) {
        setError(
          err.errors[0]?.longMessage ??
            err.errors[0]?.message ??
            "Failed to send invite",
        );
      } else {
        setError("Failed to send invite");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-xl sm:max-w-xl bg-white p-12 ring-0 shadow-lg"
        showCloseButton={false}
      >
        <DialogHeader className="gap-2">
          <DialogTitle className="text-2xl font-bold">
            Invite member
          </DialogTitle>
          <DialogDescription className="text-sm">
            They'll receive an email to join your workspace.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="rounded-lg border border-stroke-subtle bg-bg-container px-4 py-3 text-base text-text-default">
            Invite sent successfully.
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-1">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-subtle" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full rounded-md border border-stroke-subtle bg-transparent py-3 pl-10 pr-4 text-base text-text-default placeholder:text-text-subtle focus:border-stroke-default focus:outline-none transition-colors"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )}

        <DialogFooter className="border-0 bg-transparent p-0 sm:justify-center gap-3 pt-2">
          {success ? (
            <>
              <Button
                variant="secondary"
                className="h-12 w-44 text-base"
                onClick={() => setSuccess(false)}
              >
                Invite another
              </Button>
              <Button
                variant="primary"
                className="h-12 w-44 text-base"
                onClick={handleClose}
              >
                Done
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                className="h-12 w-44 text-base"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="h-12 w-44 text-base"
                onClick={handleSubmit}
                disabled={isLoading || !email}
              >
                {isLoading ? "Sending..." : "Send invite"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
