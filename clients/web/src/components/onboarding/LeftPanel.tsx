export function LeftPanel() {
  return (
    <div
      className="relative bg-white shrink-0"
      style={{
        width: "36.47vw",
        height: "100vh",
        borderRight: "1px solid #000000",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: "11.6vh",
          left: "9.8%",
          width: "78.8%",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <span
          style={{
            fontFamily: "Satoshi Variable, sans-serif",
            fontWeight: 700,
            fontSize: "24px",
            lineHeight: "32px",
            letterSpacing: "-1.13px",
          }}
        >
          SelfServe
        </span>
        <p
          style={{
            fontFamily: "Satoshi Variable, sans-serif",
            fontWeight: 500,
            fontStyle: "italic",
            fontSize: "clamp(12px, 1.5vw, 20px)",
            lineHeight: "1.6",
            margin: 0,
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec risus
          nunc, ullamcorper vitae risus vel, tristique vehicula lectus.
        </p>
      </div>
    </div>
  );
}
