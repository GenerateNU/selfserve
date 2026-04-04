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
      <div className="flex-1 flex justify-center items-start pt-[clamp(80px,19.45vh,191px)] px-[clamp(40px,9.6vw,132px)] overflow-hidden">
        <div className="w-full max-w-[663px] h-[clamp(500px,71.79vh,705px)] overflow-hidden border border-black rounded-[24px] bg-[var(--color-bg-primary)] flex flex-col items-center justify-center p-12 box-border">
          <div className="w-[256.68px] flex flex-col items-center gap-8">
            {/* Header */}
            {/* TODO: #0F172B and #62748E have no design tokens — flag to Dylan */}
            <div className="flex flex-col gap-1 text-center">
              <h1 className="font-normal text-[clamp(20px,2.5vw,24px)] leading-8 text-[#0F172B] m-0">
                Property Details
              </h1>
              <p className="font-normal text-[clamp(13px,1.6vw,16px)] leading-6 text-[#62748E] m-0">
                Lorem ipsum dolor sit amet.
              </p>
            </div>

            {/* Form fields */}
            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#0F172B]">Hotel Name</label>
                <input
                  type="text"
                  value={formData.hotelName}
                  onChange={(e) => updateForm({ hotelName: e.target.value })}
                  placeholder="Lorem ipsum dolor sit amet"
                  className="border border-[var(--color-stroke-subtle)] rounded-lg px-3 py-2 text-sm outline-none w-full box-border"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#0F172B]">
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
                <label className="text-sm text-[#0F172B]">Property Type</label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => updateForm({ propertyType: e.target.value })}
                  className="border border-[var(--color-stroke-subtle)] rounded-lg px-3 py-2 text-sm outline-none bg-white w-full box-border"
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
                className={`w-full h-14 rounded-[14px] text-white border-none text-base ${
                  isValid
                    ? "bg-[var(--color-primary)] cursor-pointer"
                    : "bg-[var(--color-primary-hover)] cursor-not-allowed"
                }`}
              >
                Continue
              </button>
              <button
                onClick={onBack}
                className="text-sm text-[#62748E] bg-transparent border-none"
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
