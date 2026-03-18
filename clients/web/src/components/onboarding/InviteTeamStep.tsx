import { useState } from "react";
import LeftPanel from "./LeftPanel";
import type { OnboardingFormData } from "./types";

interface InviteTeamStepProps {
  formData: OnboardingFormData;
  updateForm: (updates: Partial<OnboardingFormData>) => void;
}

export default function InviteTeamStep({ formData, updateForm }: InviteTeamStepProps) {
  const [invited, setInvited] = useState(false);

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <LeftPanel />
      <div style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "19.45vh",
      }}>
        {/* Card: 662.6/1371 = 48.33vw, 625/982 = 63.64vh */}
        <div style={{
          width: "48.33vw",
          height: "63.64vh",
          border: "1px solid #000000",
          borderRadius: "24px",
          backgroundColor: "#FFFFFF",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {/* Inner content block: 566.6px wide, everything stacked */}
          <div style={{
            width: "566.6px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}>
            {/* Logo */}
            <div style={{
              width: "80px",
              height: "80px",
              border: "1px solid #000000",
              borderRadius: "8px",
              backgroundColor: "#FFFFFF",
              flexShrink: 0,
            }} />

            {/* Header */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
              <h1 style={{
                fontFamily: "Satoshi Variable, sans-serif",
                fontWeight: 400,
                fontSize: "24px",
                lineHeight: "32px",
                color: "#0F172B",
                margin: 0,
              }}>
                Invite your team
              </h1>
              <p style={{
                fontFamily: "Satoshi Variable, sans-serif",
                fontWeight: 400,
                fontSize: "16px",
                lineHeight: "24px",
                color: "#62748E",
                margin: 0,
              }}>
                SelfServe is better when the whole staff is connected.
              </p>
            </div>

            {/* Email input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "390px" }}>
              <div style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#F1F5F9",
                borderRadius: "8px",
                padding: "8px 12px",
                boxSizing: "border-box",
              }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#CBD5E1", flexShrink: 0 }} />
                <input
                  type="email"
                  value={formData.inviteEmail}
                  onChange={(e) => updateForm({ inviteEmail: e.target.value })}
                  placeholder="Enter email address..."
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "14px" }}
                />
                <button
                  onClick={() => setInvited(true)}
                  style={{ fontSize: "14px", fontWeight: 600, color: "#0F172B", background: "none", border: "none", cursor: "pointer" }}
                >
                  Invite
                </button>
              </div>
              {invited && (
                <p style={{ fontSize: "12px", color: "#15803D", textAlign: "center", margin: 0 }}>Invite sent!</p>
              )}
              <p style={{ fontSize: "12px", color: "#62748E", textAlign: "center", margin: 0 }}>
                You can also do this later from your settings.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", width: "390px" }}>
              <button
                onClick={() => console.log("Go to dashboard")}
                style={{
                  width: "100%",
                  height: "56px",
                  borderRadius: "14px",
                  backgroundColor: "#15502C",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => console.log("Skip for now")}
                style={{ fontSize: "14px", color: "#62748E", background: "none", border: "none", cursor: "pointer" }}
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