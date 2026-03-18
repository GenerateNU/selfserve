import LeftPanel from "./LeftPanel";
import type { OnboardingFormData } from "./types";

interface EmployeeRoleStepProps {
  formData: OnboardingFormData;
  updateForm: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const EMPLOYEE_ROLES = [
  { id: "front_desk", label: "Role", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "housekeeping", label: "Role", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "maintenance", label: "Role", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "concierge", label: "Role", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
];

export default function EmployeeRoleStep({ formData, updateForm, onNext }: EmployeeRoleStepProps) {
  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <LeftPanel />
      <div style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "19.45vh",  // 191/982
      }}>
        {/* Card: 663/1371 wide, 652/982 tall */}
        <div style={{
          width: "48.36vw",
          height: "66.4vh",
          border: "1px solid #000000",
          borderRadius: "24px",
          backgroundColor: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "48px",
          gap: "48px",
          boxSizing: "border-box",
        }}>
          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: "center" }}>
            <h1 style={{
              fontFamily: "Satoshi Variable, sans-serif",
              fontWeight: 400,
              fontSize: "24px",
              lineHeight: "32px",
              color: "#0F172B",
              margin: 0,
            }}>
              Employee Role
            </h1>
            <p style={{
              fontFamily: "Satoshi Variable, sans-serif",
              fontWeight: 400,
              fontSize: "16px",
              lineHeight: "24px",
              color: "#62748E",
              margin: 0,
            }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>

          {/* 2x2 grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            width: "100%",
            flex: 1,
          }}>
            {EMPLOYEE_ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => { updateForm({ employeeRole: role.id }); onNext(); }}
                style={{
                  textAlign: "left",
                  borderRadius: "16px",
                  border: `2px solid ${formData.employeeRole === role.id ? "#0F172B" : "#F1F5F9"}`,
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