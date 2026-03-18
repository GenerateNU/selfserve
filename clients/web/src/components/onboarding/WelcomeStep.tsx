import LeftPanel from "./LeftPanel";

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <LeftPanel />

      {/* Right panel — flex centered, padded from top */}
      <div style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "19.45vh",  // 191/982
      }}>
        {/* Card: 616.6/1371 wide, 691/982 tall */}
        <div style={{
          width: "44.97vw",     // 616.6/1371
          height: "70.37vh",    // 691/982
          border: "1px solid #000000",
          borderRadius: "24px",
          backgroundColor: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "21.79vh", // 214/982 — pushes logo to Figma position
          boxSizing: "border-box",
        }}>

          {/* Logo box: 80×80px */}
          <div style={{
            width: "80px",
            height: "80px",
            border: "1px solid #000000",
            borderRadius: "8px",
            backgroundColor: "#FFFFFF",
            flexShrink: 0,
          }} />

          {/* Welcome + Start: 61px gap above text matches Figma inner container */}
          <div style={{
            width: "72.45%",      // 446.6/616.6
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "6.21vh", // 61/982
            gap: "16px",
          }}>
            <h1 style={{
              fontFamily: "Satoshi Variable, sans-serif",
              fontWeight: 400,
              fontSize: "30px",
              lineHeight: "36px",
              letterSpacing: "-0.35px",
              textAlign: "center",
              margin: 0,
            }}>
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
                backgroundColor: "#15502C",
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