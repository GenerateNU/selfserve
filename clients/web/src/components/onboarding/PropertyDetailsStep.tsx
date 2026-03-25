import { LeftPanel } from "./LeftPanel";
import type { OnboardingFormData } from "./types";

type PropertyDetailsStepProps = {
  formData: OnboardingFormData;
  updateForm: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PROPERTY_TYPES = ["Hotel", "Motel", "Resort", "Bed & Breakfast", "Hostel"];

export function PropertyDetailsStep({ formData, updateForm, onNext, onBack }: PropertyDetailsStepProps) {
  const isValid = formData.hotelName && formData.numberOfRooms && formData.propertyType;

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <LeftPanel />
      <div style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "clamp(80px, 19.45vh, 191px)",
        paddingLeft: "clamp(40px, 9.6vw, 132px)",
        paddingRight: "clamp(40px, 9.6vw, 132px)",
        overflow: "hidden",
      }}>
        <div style={{
          width: "100%",
          maxWidth: "663px",
          height: "clamp(500px, 71.79vh, 705px)",
          overflow: "hidden",
          border: "1px solid #000000",
          borderRadius: "24px",
          backgroundColor: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          boxSizing: "border-box",
        }}>
          <div style={{
            width: "256.68px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "32px",
          }}>
            {/* Header */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "center" }}>
              <h1 style={{
                fontFamily: "Satoshi Variable, sans-serif",
                fontWeight: 400,
                fontSize: "clamp(20px, 2.5vw, 24px)",
                lineHeight: "32px",
                color: "#0F172B",
                margin: 0,
              }}>
                Property Details
              </h1>
              <p style={{
                fontFamily: "Satoshi Variable, sans-serif",
                fontWeight: 400,
                fontSize: "clamp(13px, 1.6vw, 16px)",
                lineHeight: "24px",
                color: "#62748E",
                margin: 0,
              }}>
                Lorem ipsum dolor sit amet.
              </p>
            </div>

            {/* Form fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontFamily: "Satoshi Variable, sans-serif", fontSize: "14px", color: "#0F172B" }}>
                  Hotel Name
                </label>
                <input
                  type="text"
                  value={formData.hotelName}
                  onChange={(e) => updateForm({ hotelName: e.target.value })}
                  placeholder="Lorem ipsum dolor sit amet"
                  style={{ border: "1px solid var(--color-stroke-subtle)", borderRadius: "8px", padding: "8px 12px", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontFamily: "Satoshi Variable, sans-serif", fontSize: "14px", color: "#0F172B" }}>
                  Number of Rooms
                </label>
                <input
                  type="number"
                  value={formData.numberOfRooms}
                  onChange={(e) => updateForm({ numberOfRooms: e.target.value })}
                  placeholder="e.g. 150"
                  style={{ border: "1px solid var(--color-stroke-subtle)", borderRadius: "8px", padding: "8px 12px", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontFamily: "Satoshi Variable, sans-serif", fontSize: "14px", color: "#0F172B" }}>
                  Property Type
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => updateForm({ propertyType: e.target.value })}
                  style={{ border: "1px solid var(--color-stroke-subtle)", borderRadius: "8px", padding: "8px 12px", fontSize: "14px", outline: "none", backgroundColor: "white", width: "100%", boxSizing: "border-box" }}
                >
                  <option value="">Select a type</option>
                  {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", width: "100%" }}>
              <button
                onClick={onNext}
                disabled={!isValid}
                style={{
                  width: "100%",
                  height: "56px",
                  borderRadius: "14px",
                  backgroundColor: isValid ? "var(--color-primary)" : "var(--color-primary-hover)",
                  color: "white",
                  border: "none",
                  cursor: isValid ? "pointer" : "not-allowed",
                  fontSize: "16px",
                }}
              >
                Continue
              </button>
              <button
                onClick={onBack}
                style={{ fontSize: "14px", color: "#62748E", background: "none", border: "none", cursor: "pointer" }}
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