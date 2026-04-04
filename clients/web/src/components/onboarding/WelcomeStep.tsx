import { LeftPanel } from "./LeftPanel";

type WelcomeStepProps = {
  onNext: () => void;
};

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex w-screen h-screen">
      <LeftPanel />
      <div className="flex-1 flex justify-center items-start pt-[clamp(80px,19.45vh,191px)] px-[clamp(40px,9.6vw,132px)] overflow-hidden">
        <div className="w-full max-w-[617px] h-[clamp(500px,70.37vh,691px)] border border-black rounded-[24px] bg-[var(--color-bg-primary)] flex flex-col items-center pt-[clamp(80px,21.79vh,214px)] pb-12 px-12 box-border gap-[clamp(16px,6.21vh,61px)]">
          {/* Logo */}
          <div className="w-20 h-20 border border-black rounded-lg bg-[var(--color-bg-primary)] shrink-0" />

          {/* Welcome + Button */}
          <div className="w-[72.45%] flex flex-col items-center gap-4">
            <h1 className="font-normal text-[clamp(22px,2.5vw,30px)] leading-[1.2] tracking-[-0.35px] text-center m-0">
              Welcome
            </h1>
            <button
              onClick={() => {
                console.log("Start clicked");
                onNext();
              }}
              className="w-full h-14 rounded-[14px] bg-[var(--color-primary)] text-white border-none text-base"
            >
              Start ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
