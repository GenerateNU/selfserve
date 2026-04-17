import { View } from "react-native";
import type { OnboardingFormData } from "./types";
import { EMPLOYEE_ROLES } from "./onboarding-mocks";
import { RoleCard } from "./role-card";
import { StepLayout } from "./step-layout";

type EmployeeRoleStepProps = {
  formData: OnboardingFormData;
  updateForm: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  stepCurrent: number;
  stepTotal: number;
};

export function EmployeeRoleStep({
  formData,
  updateForm,
  onNext,
  onBack,
  stepCurrent,
  stepTotal,
}: EmployeeRoleStepProps) {
  function handleSelect(roleId: string) {
    updateForm({ employeeRole: roleId });
    onNext();
  }

  return (
    <StepLayout
      title="What's your specific role?"
      subtitle="Select the position that matches your day-to-day work."
      stepCurrent={stepCurrent}
      stepTotal={stepTotal}
      onBack={onBack}
    >
      <View className="flex-1 px-6 pt-6">
        {EMPLOYEE_ROLES.map((role) => (
          <RoleCard
            key={role.id}
            label={role.label}
            description={role.description}
            selected={formData.employeeRole === role.id}
            onSelect={() => handleSelect(role.id)}
          />
        ))}
      </View>
    </StepLayout>
  );
}
