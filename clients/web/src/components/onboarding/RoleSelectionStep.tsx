import { LeftPanel } from "./LeftPanel";
import { RoleCard } from "./RoleCard";
import type { OnboardingFormData } from "./types";

type RoleSelectionStepProps = {
  formData: OnboardingFormData;
  updateForm: (updates: Partial<OnboardingFormData>) => void;
  onNext: (role: string) => void;
};

const ROLES = [
  {
    id: "manager",
    label: "Manager",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: "employee",
    label: "Employee",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];

export function RoleSelectionStep({
  formData,
  onNext,
}: RoleSelectionStepProps) {
  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <LeftPanel />
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingTop: "clamp(80px, 19.45vh, 191px)",
          paddingLeft: "clamp(40px, 9.6vw, 132px)",
          paddingRight: "clamp(40px, 9.6vw, 132px)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "643px",
            height: "clamp(400px, 50.1vh, 492px)",
            overflow: "hidden",
            border: "1px solid #000000",
            borderRadius: "24px",
            backgroundColor: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "clamp(24px, 4.9vh, 48px) 38px",
            gap: "16px",
            boxSizing: "border-box",
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: "80px",
              height: "80px",
              border: "1px solid #000000",
              borderRadius: "8px",
              backgroundColor: "#FFFFFF",
              flexShrink: 0,
            }}
          />

          {/* Title */}
          <span
            style={{
              fontFamily: "Satoshi Variable, sans-serif",
              fontWeight: 400,
              fontSize: "clamp(20px, 2.5vw, 24px)",
              lineHeight: "32px",
              color: "#0F172B",
              textAlign: "center",
            }}
          >
            Role
          </span>

          {/* Subtitle */}
          <span
            style={{
              fontFamily: "Satoshi Variable, sans-serif",
              fontWeight: 400,
              fontSize: "clamp(13px, 1.6vw, 16px)",
              lineHeight: "24px",
              color: "#62748E",
              textAlign: "center",
              marginTop: "-8px",
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </span>

          {/* Role cards grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              width: "100%",
              flex: 1,
            }}
          >
            {ROLES.map((role) => (
              <RoleCard
                key={role.id}
                label={role.label}
                description={role.description}
                selected={formData.role === role.id}
                onSelect={() => onNext(role.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
