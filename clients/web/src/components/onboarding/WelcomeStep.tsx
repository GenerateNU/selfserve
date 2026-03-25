import { LeftPanel } from "./LeftPanel";

type WelcomeStepProps = {
  onNext: () => void;
};

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <LeftPanel />
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingTop: "clamp(80px, 19.45vh, 191px)",
          paddingLeft: "clamp(40px, 9.6vw, 132px)",
          paddingRight: "clamp(40px, 9.6vw, 132px)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "617px",
            height: "clamp(500px, 70.37vh, 691px)",
            border: "1px solid #000000",
            borderRadius: "24px",
            backgroundColor: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "clamp(80px, 21.79vh, 214px)",
            paddingBottom: "48px",
            paddingLeft: "48px",
            paddingRight: "48px",
            boxSizing: "border-box",
            gap: "clamp(16px, 6.21vh, 61px)",
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: "80px",
              height: "80px",
              border: "1px solid #000000",
              borderRadius: "8px",
              backgroundColor: "#FFFFFF",
              flexShrink: 0,
            }}
          />

          {/* Welcome + Button */}
          <div
            style={{
              width: "72.45%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <h1
              style={{
                fontFamily: "Satoshi Variable, sans-serif",
                fontWeight: 400,
                fontSize: "clamp(22px, 2.5vw, 30px)",
                lineHeight: "1.2",
                letterSpacing: "-0.35px",
                textAlign: "center",
                margin: 0,
              }}
            >
              Welcome
            </h1>
            <button
              onClick={() => {
                console.log("Start clicked");
                onNext();
              }}
              style={{
                width: "100%",
                height: "56px",
                borderRadius: "14px",
                backgroundColor: "var(--color-primary)",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Start ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
