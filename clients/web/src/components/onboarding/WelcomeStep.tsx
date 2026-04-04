import { LeftPanel } from "./LeftPanel";

type WelcomeStepProps = {
  onNext: () => void;
};

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex w-screen h-screen">
      <LeftPanel />
      <div className="flex-1 flex justify-center items-start pt-[clamp(5rem,19.45vh,11.9375rem)] px-[clamp(2.5rem,9.6vw,8.25rem)] overflow-hidden">
        <div className="w-full max-w-[38.5625rem] h-[clamp(31.25rem,70.37vh,43.1875rem)] border border-text-default rounded-[1.5rem] bg-bg-primary flex flex-col items-center pt-[clamp(5rem,21.79vh,13.375rem)] pb-12 px-12 box-border gap-[clamp(1rem,6.21vh,3.8125rem)]">
          {/* Logo */}
          <div className="w-20 h-20 border border-text-default rounded-lg bg-bg-primary shrink-0" />

          {/* Welcome + Button */}
          <div className="w-[72.45%] flex flex-col items-center gap-4">
            <h1 className="font-normal text-[clamp(1.375rem,2.5vw,1.875rem)] leading-[1.2] tracking-[-0.021875rem] text-center m-0">
              Welcome
            </h1>
            <button
              onClick={() => {
                console.log("Start clicked");
                onNext();
              }}
              className="w-full h-14 rounded-[0.875rem] bg-primary text-bg-primary border-none text-base"
            >
              Start ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
