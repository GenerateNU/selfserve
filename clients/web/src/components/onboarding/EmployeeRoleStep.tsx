import LeftPanel from "./LeftPanel";
import type { OnboardingFormData } from "./types";

interface EmployeeRoleStepProps {
  formData: OnboardingFormData;
  updateForm: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const EMPLOYEE_ROLES = [
  {
    id: "front_desk",
    label: "Role",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: "housekeeping",
    label: "Role",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: "maintenance",
    label: "Role",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: "concierge",
    label: "Role",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];

export default function EmployeeRoleStep({
  formData,
  updateForm,
  onNext,
}: EmployeeRoleStepProps) {
  return (
    <div className="flex flex-row w-[1371px] h-[982px]">
      <LeftPanel />

      {/* Right panel */}
      <div className="w-[881px] border border-[#000000] bg-white flex items-center justify-center">
        {/* Card */}
        <div
          className="bg-[#FFFFFF] border border-[#000000] flex flex-col items-center"
          style={{
            width: "663px",
            height: "652px",
            borderRadius: "24px",
            padding: "48px",
            gap: "45px",
          }}
        >
          {/* Header */}
          <div
            className="flex flex-col gap-2 w-full"
            style={{ width: "566px", height: "64px", padding: "54px" }}
          >
            <h1
              style={{
                fontFamily: "Satoshi Variable",
                fontWeight: 400,
                fontSize: "24px",
                lineHeight: "32px",
                color: "#0F172B",
                textAlign: "center",
              }}
            >
              Employee Role
            </h1>
            <p
              style={{
                fontFamily: "Satoshi Variable",
                fontWeight: 400,
                fontSize: "16px",
                lineHeight: "24px",
                color: "#62748E",
                textAlign: "center",
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>

          {/* 2x2 Role cards grid */}
          <div
            className="w-full grid flex-1"
            style={{ gridTemplateColumns: "1fr 1fr", gap: "16px" }}
          >
            {EMPLOYEE_ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => {
                  updateForm({ employeeRole: role.id });
                  onNext();
                }}
                className="text-left bg-[#FFFFFF]"
                style={{
                  borderRadius: "16px",
                  border: `2px solid ${formData.employeeRole === role.id ? "#0F172B" : "#F1F5F9"}`,
                  padding: "60px 16px 16px 16px",
                  height: "184px",
                  width: "275.296875px",
                }}
              >
                <div
                  style={{
                    fontFamily: "Satoshi Variable",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "#0F172B",
                  }}
                >
                  {role.label}
                </div>
                <div
                  style={{
                    fontFamily: "Satoshi Variable",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "#62748E",
                    marginTop: "4px",
                  }}
                >
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
