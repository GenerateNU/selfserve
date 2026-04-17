export type OnboardingFormData = {
  role: string | null;
  employeeRole: string | null;
  hotelName: string;
  numberOfRooms: string;
  propertyType: string;
  inviteEmail: string;
};

export type OnboardingStep =
  | "welcome"
  | "role"
  | "employeeRole"
  | "propertyDetails"
  | "inviteTeam";
