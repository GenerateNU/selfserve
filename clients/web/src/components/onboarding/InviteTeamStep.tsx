import { useState } from "react";
import LeftPanel from "./LeftPanel";
import type { OnboardingFormData } from "./types";

interface InviteTeamStepProps {
  formData: OnboardingFormData;
  updateForm: (updates: Partial<OnboardingFormData>) => void;
}

export default function InviteTeamStep({
  formData,
  updateForm,
}: InviteTeamStepProps) {
  const [invited, setInvited] = useState(false);

  return (
    <div className="flex flex-row w-[1371px] h-[982px]">
      <LeftPanel />

      {/* Right panel */}
      <div
        className="w-[881px] border border-[#000000] bg-white flex items-start justify-center"
        style={{ padding: "220px 109px 178px 200px" }}
      >
        {/* Card */}
        <div
          className="bg-[#FFFFFF] border border-[#000000] flex flex-col items-center"
          style={{
            width: "662.6px",
            height: "625px",
            borderRadius: "24px",
            padding: "48px",
            gap: "50px",
          }}
        >
          {/* Header */}
          <div className="flex flex-col items-center gap-6">
            {/* Logo placeholder */}
            <div
              className="border border-[#000000] bg-[#FFFFFF]"
              style={{ width: "80px", height: "80px", borderRadius: "8px" }}
            />
            <div className="flex flex-col items-center gap-2">
              <h1
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: "24px",
                  lineHeight: "32px",
                  color: "#0F172B",
                  textAlign: "center",
                }}
              >
                Invite your team
              </h1>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: "16px",
                  lineHeight: "24px",
                  color: "#62748E",
                  textAlign: "center",
                }}
              >
                SelfServe is better when the whole staff is connected.
              </p>
            </div>
          </div>

          {/* Email invite */}
          <div
            className="flex flex-col gap-2 items-center"
            style={{ width: "390px" }}
          >
            <div className="w-full flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <div className="w-6 h-6 rounded-full bg-gray-300 shrink-0" />
              <input
                type="email"
                value={formData.inviteEmail}
                onChange={(e) => updateForm({ inviteEmail: e.target.value })}
                placeholder="Enter email address..."
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <button
                onClick={() => setInvited(true)}
                className="text-sm font-semibold text-gray-900 hover:text-green-900 transition-colors"
              >
                Invite
              </button>
            </div>
            {invited && (
              <p className="text-xs text-green-700 text-center">Invite sent!</p>
            )}
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                color: "#62748E",
                textAlign: "center",
              }}
            >
              You can also do this later from your settings.
            </p>
          </div>

          {/* Actions */}
          <div
            className="flex flex-col gap-3 items-center"
            style={{ width: "390.02px" }}
          >
            <button
              className="w-full bg-green-900 hover:bg-green-800 text-white flex items-center justify-center transition-colors"
              style={{ height: "56px", borderRadius: "14px" }}
              onClick={() => console.log("Go to dashboard")}
            >
              Go to Dashboard
            </button>
            <button
              className="text-sm text-center"
              style={{ color: "#62748E" }}
              onClick={() => console.log("Skip for now")}
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
