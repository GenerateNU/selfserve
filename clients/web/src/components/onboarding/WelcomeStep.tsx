import LeftPanel from "./LeftPanel";

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-row w-[1371px] h-[982px]">
      <LeftPanel />

      {/* Right panel */}
      <div
        className="w-[881px] border border-[#000000] bg-white flex items-start justify-center gap-[10px]"
        style={{ padding: "191px 132px" }}
      >
        {/* Welcome card */}
        <div
          className="relative border border-[#000000] bg-white"
          style={{ width: "616.6px", height: "691px", borderRadius: "24px" }}
        >
          {/* Logo placeholder */}
          <div
            className="absolute border border-[#000000] bg-[#FFFFFF]"
            style={{
              width: "80px",
              height: "80px",
              top: "214px",
              left: "268px",
              borderRadius: "8px",
            }}
          />

          {/* Inner container: Welcome + Start */}
          <div
            className="absolute"
            style={{
              width: "446.6px",
              height: "193px",
              top: "294px",
              left: "85px",
            }}
          >
            {/* Welcome text */}
            <h1
              className="absolute"
              style={{
                width: "384px",
                height: "36px",
                top: "61px",
                left: "31px",
                fontFamily: "Satoshi Variable",
                fontWeight: 400,
                fontSize: "30px",
                lineHeight: "36px",
                letterSpacing: "-0.35px",
                textAlign: "center",
              }}
            >
              Welcome
            </h1>
            {/* Start button */}
            <button
              onClick={onNext}
              className="absolute bg-green-900 hover:bg-green-800 text-white flex items-center justify-center transition-colors"
              style={{
                width: "446.6px",
                height: "56px",
                top: "121px",
                left: "0px",
                borderRadius: "14px",
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
