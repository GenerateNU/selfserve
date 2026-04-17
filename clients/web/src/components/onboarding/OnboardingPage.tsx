import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "@tanstack/react-router";
import { WelcomeStep } from "./WelcomeStep";
import { RoleSelectionStep } from "./RoleSelectionStep";
import { EmployeeRoleStep } from "./EmployeeRoleStep";
import { PropertyDetailsStep } from "./PropertyDetailsStep";
import { InviteTeamStep } from "./InviteTeamStep";
import type { OnboardingFormData } from "./types";

const INITIAL_FORM_DATA: OnboardingFormData = {
  role: null,
  employeeRole: null,
  hotelName: "",
  numberOfRooms: "",
  propertyType: "",
  inviteEmail: "",
};

type Step =
  | "welcome"
  | "role"
  | "employeeRole"
  | "propertyDetails"
  | "inviteTeam";

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [formData, setFormData] =
    useState<OnboardingFormData>(INITIAL_FORM_DATA);
  const [isPending, setIsPending] = useState(false);

  const { userId, getToken } = useAuth();
  const navigate = useNavigate();

  const updateForm = (updates: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleRoleSelected = (role: string) => {
    updateForm({ role });
    if (role === "employee") {
      setCurrentStep("employeeRole");
    } else {
      setCurrentStep("propertyDetails");
    }
  };

  const handleSubmit = async () => {
    if (!userId) return;
    setIsPending(true);
    try {
      const token = await getToken();
      await fetch(`${process.env.API_BASE_URL}/users/${userId}/onboard`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: formData.role ?? undefined,
          hotel_name: formData.hotelName || undefined,
          department: formData.employeeRole ?? undefined,
        }),
      });
      navigate({ to: "/" });
    } finally {
      setIsPending(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return <WelcomeStep onNext={() => setCurrentStep("role")} />;
      case "role":
        return (
          <RoleSelectionStep
            formData={formData}
            updateForm={updateForm}
            onNext={handleRoleSelected}
          />
        );
      case "employeeRole":
        return (
          <EmployeeRoleStep
            formData={formData}
            updateForm={updateForm}
            onNext={() => setCurrentStep("propertyDetails")}
            onBack={() => setCurrentStep("role")}
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
                formData.role === "employee" ? "employeeRole" : "role",
              )
            }
          />
        );
      case "inviteTeam":
        return (
          <InviteTeamStep
            formData={formData}
            updateForm={updateForm}
            onNext={handleSubmit}
            isSubmitting={isPending}
          />
        );
    }
  };

  return <div>{renderStep()}</div>;
}