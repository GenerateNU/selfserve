export default function LeftPanel() {
  return (
    <div
      className="relative bg-white shrink-0"
      style={{
        width: "36.47vw",  // 500/1371
        height: "100vh",
        borderRight: "1px solid #000000",
      }}
    >
      <div style={{ position: "absolute", bottom: "21.9vh", left: "9.8%" }}>
        <span style={{
          fontFamily: "Satoshi Variable, sans-serif",
          fontWeight: 700,
          fontSize: "24px",
          lineHeight: "32px",
          letterSpacing: "-1.13px",
        }}>
          SelfServe
        </span>
      </div>
      <div style={{ position: "absolute", bottom: "11.6vh", left: "9.8%", width: "78.8%" }}>
        <p style={{
          fontFamily: "Satoshi Variable, sans-serif",
          fontWeight: 500,
          fontStyle: "italic",
          fontSize: "20px",
          lineHeight: "32.5px",
        }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec risus
          nunc, ullamcorper vitae risus vel, tristique vehicula lectus.
        </p>
      </div>
    </div>
  );
}