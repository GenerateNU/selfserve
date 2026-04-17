import { useState } from "react";
import { router } from "expo-router";
import type { OnboardingFormData, OnboardingStep } from "./types";
import { WelcomeStep } from "./welcome-step";
import { RoleSelectionStep } from "./role-selection-step";
import { EmployeeRoleStep } from "./employee-role-step";
import { PropertyDetailsStep } from "./property-details-step";
import { InviteTeamStep } from "./invite-team-step";

const INITIAL_FORM_DATA: OnboardingFormData = {
  role: null,
  employeeRole: null,
  hotelName: "",
  numberOfRooms: "",
  propertyType: "",
  inviteEmail: "",
};

function getStepProgress(
  step: OnboardingStep,
  role: string | null
): { current: number; total: number } | null {
  if (step === "welcome") return null;

  if (role === "employee") {
    const steps: OnboardingStep[] = [
      "role",
      "employeeRole",
      "propertyDetails",
      "inviteTeam",
    ];
    return { current: steps.indexOf(step) + 1, total: 4 };
  }

  const steps: OnboardingStep[] = ["role", "propertyDetails", "inviteTeam"];
  const index = steps.indexOf(step);
  // Before role is confirmed, show indeterminate progress
  return { current: index >= 0 ? index + 1 : 1, total: 3 };
}

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [formData, setFormData] = useState<OnboardingFormData>(INITIAL_FORM_DATA);

  function updateForm(updates: Partial<OnboardingFormData>) {
    setFormData((prev) => ({ ...prev, ...updates }));
  }

  function handleRoleSelected(role: string) {
    if (role === "employee") {
      setCurrentStep("employeeRole");
    } else {
      setCurrentStep("propertyDetails");
    }
  }

  function handleComplete() {
    router.replace("/(tabs)");
  }

  const progress = getStepProgress(currentStep, formData.role);

  switch (currentStep) {
    case "welcome":
      return <WelcomeStep onNext={() => setCurrentStep("role")} />;

    case "role":
      return (
        <RoleSelectionStep
          formData={formData}
          updateForm={updateForm}
          onNext={handleRoleSelected}
          onBack={() => setCurrentStep("welcome")}
          stepCurrent={progress!.current}
          stepTotal={progress!.total}
        />
      );

    case "employeeRole":
      return (
        <EmployeeRoleStep
          formData={formData}
          updateForm={updateForm}
          onNext={() => setCurrentStep("propertyDetails")}
          onBack={() => setCurrentStep("role")}
          stepCurrent={progress!.current}
          stepTotal={progress!.total}
        />
      );

    case "propertyDetails":
      return (
        <PropertyDetailsStep
          formData={formData}
          updateForm={updateForm}
          onNext={() => setCurrentStep("inviteTeam")}
          onBack={() =>
            setCurrentStep(
              formData.role === "employee" ? "employeeRole" : "role"
            )
          }
          stepCurrent={progress!.current}
          stepTotal={progress!.total}
        />
      );

    case "inviteTeam":
      return (
        <InviteTeamStep
          formData={formData}
          updateForm={updateForm}
          onComplete={handleComplete}
        />
      );
  }
}
