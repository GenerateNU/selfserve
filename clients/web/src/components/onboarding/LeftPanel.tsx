export function LeftPanel() {
  return (
    <div className="relative bg-bg-primary shrink-0 w-[36.47vw] h-screen border-r border-text-default overflow-hidden">
      <div className="absolute bottom-[11.6vh] left-[9.8%] w-[78.8%] flex flex-col gap-2">
        <span className="font-bold text-[1.5rem] leading-8 tracking-[-0.070625rem]">
          SelfServe
        </span>
        <p className="font-medium italic text-[clamp(0.75rem,1.5vw,1.25rem)] leading-[1.6] m-0">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec risus
          nunc, ullamcorper vitae risus vel, tristique vehicula lectus.
        </p>
      </div>
    </div>
  );
}
