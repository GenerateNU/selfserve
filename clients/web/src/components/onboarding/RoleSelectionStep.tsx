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
      <div className="flex-1 flex justify-center items-start pt-[clamp(80px,19.45vh,191px)] px-[clamp(40px,9.6vw,132px)] overflow-hidden">
        <div className="w-full max-w-[643px] h-[clamp(400px,50.1vh,492px)] overflow-hidden border border-black rounded-[24px] bg-[var(--color-bg-primary)] flex flex-col items-center py-[clamp(24px,4.9vh,48px)] px-[38px] gap-4 box-border">
          {/* Logo */}
          <div className="w-20 h-20 border border-black rounded-lg bg-[var(--color-bg-primary)] shrink-0" />

          {/* Title */}
          {/* TODO: #0F172B has no design token — flag to Dylan */}
          <span className="font-normal text-[clamp(20px,2.5vw,24px)] leading-8 text-[#0F172B] text-center">
            Role
          </span>

          {/* Subtitle */}
          {/* TODO: #62748E has no design token — flag to Dylan */}
          <span className="font-normal text-[clamp(13px,1.6vw,16px)] leading-6 text-[#62748E] text-center -mt-2">
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
