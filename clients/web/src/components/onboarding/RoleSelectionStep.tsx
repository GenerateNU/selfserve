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
    <div className="flex w-screen h-screen">
      <LeftPanel />
      <div className="flex-1 flex justify-center items-start pt-[clamp(5rem,19.45vh,11.9375rem)] px-[clamp(2.5rem,9.6vw,8.25rem)] overflow-hidden">
        <div className="w-full max-w-[40.1875rem] h-[clamp(25rem,50.1vh,30.75rem)] overflow-hidden border border-[var(--color-text-default)] rounded-[1.5rem] bg-[var(--color-bg-primary)] flex flex-col items-center py-[clamp(1.5rem,4.9vh,3rem)] px-[2.375rem] gap-4 box-border">
          {/* Logo */}
          <div className="w-20 h-20 border border-[var(--color-text-default)] rounded-lg bg-[var(--color-bg-primary)] shrink-0" />

          {/* Title */}
          <span className="font-normal text-[clamp(1.25rem,2.5vw,1.5rem)] leading-8 text-[var(--color-text-heading)] text-center">
            Role
          </span>

          {/* Subtitle */}
          <span className="font-normal text-[clamp(0.8125rem,1.6vw,1rem)] leading-6 text-[var(--color-text-muted)] text-center -mt-2">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </span>

          {/* Role cards grid */}
          <div className="grid grid-cols-2 gap-4 w-full flex-1">
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
