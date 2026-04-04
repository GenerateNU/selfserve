import { LeftPanel } from "./LeftPanel";
import { ROLES } from "./onboardingMocks";
import { RoleCard } from "./RoleCard";
import type { OnboardingFormData } from "./types";

type EmployeeRoleStepProps = {
  formData: OnboardingFormData;
  updateForm: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function EmployeeRoleStep({
  formData,
  updateForm,
  onNext,
}: EmployeeRoleStepProps) {
  return (
    <div className="flex w-screen h-screen">
      <LeftPanel />
      <div className="flex-1 flex justify-center items-start pt-[clamp(80px,19.45vh,191px)] px-[clamp(40px,9.6vw,132px)] overflow-hidden">
        <div className="w-full max-w-[663px] h-[clamp(400px,66.4vh,652px)] overflow-hidden rounded-[24px] box-border border border-black bg-white flex flex-col items-center p-12 gap-12">
          {/* Header */}
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-gray-900 text-2xl font-normal leading-8 m-0">
              Employee Role
            </h1>
            <p className="text-gray-500 text-base font-normal leading-6 m-0">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>

          {/* 2x2 grid */}
          <div className="grid grid-cols-2 gap-4 w-full flex-1">
            {ROLES.map((role) => (
              <RoleCard
                key={role.id}
                label={role.label}
                description={role.description}
                selected={formData.employeeRole === role.id}
                onSelect={() => {
                  updateForm({ employeeRole: role.id });
                  onNext();
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
