import { View } from "react-native";
import type { OnboardingFormData } from "./types";
import { TOP_LEVEL_ROLES } from "./onboarding-mocks";
import { RoleCard } from "./role-card";
import { StepLayout } from "./step-layout";

type RoleSelectionStepProps = {
  formData: OnboardingFormData;
  updateForm: (updates: Partial<OnboardingFormData>) => void;
  onNext: (role: string) => void;
  onBack: () => void;
  stepCurrent: number;
  stepTotal: number;
};

export function RoleSelectionStep({
  formData,
  updateForm,
  onNext,
  onBack,
  stepCurrent,
  stepTotal,
}: RoleSelectionStepProps) {
  function handleSelect(roleId: string) {
    updateForm({ role: roleId });
    onNext(roleId);
  }

  return (
    <StepLayout
      title="What's your role?"
      subtitle="Choose the role that best describes your position."
      stepCurrent={stepCurrent}
      stepTotal={stepTotal}
      onBack={onBack}
    >
      <View className="flex-1 px-6 pt-6">
        {TOP_LEVEL_ROLES.map((role) => (
          <RoleCard
            key={role.id}
            label={role.label}
            description={role.description}
            selected={formData.role === role.id}
            onSelect={() => handleSelect(role.id)}
          />
        ))}
      </View>
    </StepLayout>
  );
}
