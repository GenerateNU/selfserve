import { LeftPanel } from "./LeftPanel";
import type { OnboardingFormData } from "./types";

type PropertyDetailsStepProps = {
  formData: OnboardingFormData;
  updateForm: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
};

const PROPERTY_TYPES = [
  "Hotel",
  "Motel",
  "Resort",
  "Bed & Breakfast",
  "Hostel",
];

export function PropertyDetailsStep({
  formData,
  updateForm,
  onNext,
  onBack,
}: PropertyDetailsStepProps) {
  const isValid =
    formData.hotelName && formData.numberOfRooms && formData.propertyType;

  return (
    <div className="flex w-screen h-screen">
      <LeftPanel />
      <div className="flex-1 flex justify-center items-start pt-[clamp(5rem,19.45vh,11.9375rem)] px-[clamp(2.5rem,9.6vw,8.25rem)] overflow-hidden">
        <div className="w-full max-w-[41.4375rem] h-[clamp(31.25rem,71.79vh,44.0625rem)] overflow-hidden border border-[var(--color-text-default)] rounded-[1.5rem] bg-[var(--color-bg-primary)] flex flex-col items-center justify-center p-12 box-border">
          <div className="w-[16.0425rem] flex flex-col items-center gap-8">
            {/* Header */}
            <div className="flex flex-col gap-1 text-center">
              <h1 className="font-normal text-[clamp(1.25rem,2.5vw,1.5rem)] leading-8 text-[var(--color-text-heading)] m-0">
                Property Details
              </h1>
              <p className="font-normal text-[clamp(0.8125rem,1.6vw,1rem)] leading-6 text-[var(--color-text-muted)] m-0">
                Lorem ipsum dolor sit amet.
              </p>
            </div>

            {/* Form fields */}
            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[var(--color-text-heading)]">
                  Hotel Name
                </label>
                <input
                  type="text"
                  value={formData.hotelName}
                  onChange={(e) => updateForm({ hotelName: e.target.value })}
                  placeholder="Lorem ipsum dolor sit amet"
                  className="border border-[var(--color-stroke-subtle)] rounded-lg px-3 py-2 text-sm outline-none w-full box-border"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[var(--color-text-heading)]">
                  Number of Rooms
                </label>
                <input
                  type="number"
                  value={formData.numberOfRooms}
                  onChange={(e) =>
                    updateForm({ numberOfRooms: e.target.value })
                  }
                  placeholder="e.g. 150"
                  className="border border-[var(--color-stroke-subtle)] rounded-lg px-3 py-2 text-sm outline-none w-full box-border"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[var(--color-text-heading)]">
                  Property Type
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => updateForm({ propertyType: e.target.value })}
                  className="border border-[var(--color-stroke-subtle)] rounded-lg px-3 py-2 text-sm outline-none bg-[var(--color-bg-primary)] w-full box-border"
                >
                  <option value="">Select a type</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 items-center w-full">
              <button
                onClick={onNext}
                disabled={!isValid}
                className={`w-full h-14 rounded-[0.875rem] text-[var(--color-bg-primary)] border-none text-base ${
                  isValid
                    ? "bg-[var(--color-primary)] cursor-pointer"
                    : "bg-[var(--color-primary-hover)] cursor-not-allowed"
                }`}
              >
                Continue
              </button>
              <button
                onClick={onBack}
                className="text-sm text-[var(--color-text-muted)] bg-transparent border-none"
              >
                ‹ Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
