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
      <div className="flex-1 flex justify-center items-start pt-[clamp(5rem,19.45vh,11.9375rem)] px-[clamp(2.5rem,9.6vw,8.25rem)] overflow-hidden">
        <div className="w-full max-w-[41.4375rem] h-[clamp(25rem,66.4vh,40.75rem)] overflow-hidden rounded-[1.5rem] box-border border border-[var(--color-text-default)] bg-[var(--color-bg-primary)] flex flex-col items-center p-12 gap-12">
          {/* Header */}
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-[var(--color-text-default)] text-2xl font-normal leading-8 m-0">
              Employee Role
            </h1>
            <p className="text-[var(--color-text-subtle)] text-base font-normal leading-6 m-0">
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
