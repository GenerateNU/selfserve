import { useState } from "react";
import { LeftPanel } from "./LeftPanel";
import type { OnboardingFormData } from "./types";

type InviteTeamStepProps = {
  formData: OnboardingFormData;
  updateForm: (updates: Partial<OnboardingFormData>) => void;
};

export function InviteTeamStep({ formData, updateForm }: InviteTeamStepProps) {
  const [invited, setInvited] = useState(false);

  return (
    <div className="flex w-screen h-screen">
      <LeftPanel />
      <div className="flex-1 flex justify-center items-start pt-[clamp(80px,19.45vh,191px)] px-[clamp(40px,9.6vw,132px)] overflow-hidden">
        <div className="w-full max-w-[663px] h-[clamp(450px,63.64vh,625px)] overflow-hidden border border-black rounded-[24px] bg-[var(--color-bg-primary)] box-border flex items-center justify-center">
          <div className="w-[90%] max-w-[567px] flex flex-col items-center gap-6">
            {/* Logo */}
            <div className="w-20 h-20 border border-black rounded-lg bg-[var(--color-bg-primary)] shrink-0" />

            {/* Header */}
            {/* TODO: #0F172B and #62748E have no design tokens — flag to Dylan */}
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="font-normal text-[clamp(20px,2.5vw,24px)] leading-8 text-[#0F172B] m-0">
                Invite your team
              </h1>
              <p className="font-normal text-[clamp(13px,1.6vw,16px)] leading-6 text-[#62748E] m-0">
                SelfServe is better when the whole staff is connected.
              </p>
            </div>

            {/* Email input */}
            {/* TODO: bg-slate-100 (#F1F5F9) and bg-slate-300 (#CBD5E1) have no design tokens — flag to Dylan */}
            <div className="flex flex-col gap-2 w-full">
              <div className="w-full flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 box-border">
                <div className="w-6 h-6 rounded-full bg-slate-300 shrink-0" />
                <input
                  type="email"
                  value={formData.inviteEmail}
                  onChange={(e) => updateForm({ inviteEmail: e.target.value })}
                  placeholder="Enter email address..."
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                />
                <button
                  onClick={() => setInvited(true)}
                  className="text-sm font-semibold text-[#0F172B] bg-transparent border-none"
                >
                  Invite
                </button>
              </div>
              {invited && (
                <p className="text-xs text-[var(--color-success-stroke)] text-center m-0">
                  Invite sent!
                </p>
              )}
              <p className="text-xs text-[#62748E] text-center m-0">
                You can also do this later from your settings.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 items-center w-full">
              <button
                onClick={() => console.log("Go to dashboard")}
                className="w-full h-14 rounded-[14px] bg-[var(--color-primary)] text-white border-none text-base"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => console.log("Skip for now")}
                className="text-sm text-[#62748E] bg-transparent border-none"
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
