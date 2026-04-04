export function LeftPanel() {
  return (
    <div className="relative bg-[var(--color-bg-primary)] shrink-0 w-[36.47vw] h-screen border-r border-black overflow-hidden">
      <div className="absolute bottom-[11.6vh] left-[9.8%] w-[78.8%] flex flex-col gap-2">
        <span className="font-bold text-2xl leading-8 tracking-[-1.13px]">
          SelfServe
        </span>
        <p className="font-medium italic text-[clamp(12px,1.5vw,20px)] leading-[1.6] m-0">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec risus
          nunc, ullamcorper vitae risus vel, tristique vehicula lectus.
        </p>
      </div>
    </div>
  );
}
