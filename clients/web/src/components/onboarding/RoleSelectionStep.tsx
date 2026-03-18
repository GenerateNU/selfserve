import LeftPanel from "./LeftPanel";
import type { OnboardingFormData } from "./types";

interface RoleSelectionStepProps {
  formData: OnboardingFormData;
  updateForm: (updates: Partial<OnboardingFormData>) => void;
  onNext: (role: string) => void;
}

const ROLES = [
  { id: "manager", label: "Manager", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "employee", label: "Employee", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
];

export default function RoleSelectionStep({ formData, onNext }: RoleSelectionStepProps) {
  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <LeftPanel />
      <div style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "19.45vh",  // 191/982 — same as welcome
      }}>
        {/* Card: 642.6/1371 wide, 492/982 tall */}
        <div style={{
          width: "46.87vw",
          height: "50.1vh",
          border: "1px solid #000000",
          borderRadius: "24px",
          backgroundColor: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "48px 38px",
          gap: "16px",
          boxSizing: "border-box",
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

          {/* Title */}
          <span style={{
            fontFamily: "Satoshi Variable, sans-serif",
            fontWeight: 400,
            fontSize: "24px",
            lineHeight: "32px",
            color: "#0F172B",
            textAlign: "center",
          }}>
            Role
          </span>

          {/* Subtitle */}
          <span style={{
            fontFamily: "Satoshi Variable, sans-serif",
            fontWeight: 400,
            fontSize: "16px",
            lineHeight: "24px",
            color: "#62748E",
            textAlign: "center",
            marginTop: "-8px",
          }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </span>

          {/* Role cards grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            width: "100%",
            flex: 1,
          }}>
            {ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => onNext(role.id)}
                style={{
                  textAlign: "left",
                  borderRadius: "16px",
                  border: `2px solid ${formData.role === role.id ? "#0F172B" : "#F1F5F9"}`,
                  padding: "16px",
                  backgroundColor: "#FFFFFF",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontFamily: "Satoshi Variable, sans-serif", fontWeight: 400, fontSize: "16px", color: "#0F172B" }}>
                  {role.label}
                </div>
                <div style={{ fontFamily: "Satoshi Variable, sans-serif", fontWeight: 400, fontSize: "16px", color: "#62748E", marginTop: "4px" }}>
                  {role.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}