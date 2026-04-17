import { useState } from "react";
import { LeftPanel } from "./LeftPanel";
import type { OnboardingFormData } from "./types";

type InviteTeamStepProps = {
  formData: OnboardingFormData;
  updateForm: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  isSubmitting?: boolean;
};

export function InviteTeamStep({
  formData,
  updateForm,
  onNext,
  isSubmitting,
}: InviteTeamStepProps) {
  const [invited, setInvited] = useState(false);
  return (
    <div className="flex w-screen h-screen">
      <LeftPanel />
      <div className="flex-1 flex justify-center items-start pt-[clamp(5rem,19.45vh,11.9375rem)] px-[clamp(2.5rem,9.6vw,8.25rem)] overflow-hidden">
        <div className="w-full max-w-[41.4375rem] h-[clamp(28.125rem,63.64vh,39.0625rem)] overflow-hidden border border-text-default rounded-[1.5rem] bg-bg-primary box-border flex items-center justify-center">
          <div className="w-[90%] max-w-[35.4375rem] flex flex-col items-center gap-6">
            {/* Logo */}
            <div className="w-20 h-20 border border-text-default rounded-lg bg-bg-primary shrink-0" />
            {/* Header */}
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="font-normal text-[clamp(1.25rem,2.5vw,1.5rem)] leading-8 text-text-heading m-0">
                Invite your team
              </h1>
              <p className="font-normal text-[clamp(0.8125rem,1.6vw,1rem)] leading-6 text-text-muted m-0">
                SelfServe is better when the whole staff is connected.
              </p>
            </div>
            {/* Email input */}
            <div className="flex flex-col gap-2 w-full">
              <div className="w-full flex items-center gap-2 bg-bg-input rounded-lg px-3 py-2 box-border">
                <div className="w-6 h-6 rounded-full bg-bg-avatar shrink-0" />
                <input
                  type="email"
                  value={formData.inviteEmail}
                  onChange={(e) => updateForm({ inviteEmail: e.target.value })}
                  placeholder="Enter email address..."
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                />
                <button
                  onClick={() => setInvited(true)}
                  className="text-sm font-semibold text-text-heading bg-transparent border-none"
                >
                  Invite
                </button>
              </div>
              {invited && (
                <p className="text-xs text-success-stroke text-center m-0">
                  Invite sent!
                </p>
              )}
              <p className="text-xs text-text-muted text-center m-0">
                You can also do this later from your settings.
              </p>
            </div>
            {/* Actions */}
            <div className="flex flex-col gap-3 items-center w-full">
              <button
                onClick={onNext}
                disabled={isSubmitting}
                className="w-full h-14 rounded-[0.875rem] bg-primary text-bg-primary border-none text-base disabled:opacity-50"
              >
                {isSubmitting ? "Setting up..." : "Go to Dashboard"}
              </button>
              <button
                onClick={onNext}
                disabled={isSubmitting}
                className="text-sm text-text-muted bg-transparent border-none"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
