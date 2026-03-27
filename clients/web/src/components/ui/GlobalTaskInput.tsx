import { useState } from "react";
import { Sparkles, ArrowUp } from "lucide-react";

export function GlobalTaskInput() {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim()) return;
    // TODO: wire up to task creation
    setValue("");
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[684px] h-[58px] flex items-center gap-3 rounded-2xl bg-white shadow-lg border border-stroke-subtle px-4">
      <Sparkles className="size-6 shrink-0 text-primary" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Start typing to create new task..."
        className="flex-1 bg-transparent text-sm text-text-default placeholder:text-text-subtle outline-none"
      />
      <button
        type="button"
        onClick={handleSubmit}
        className={`flex size-8 shrink-0 items-center justify-center rounded-full cursor-pointer transition-colors ${
          value.trim() ? "bg-primary" : "bg-bg-selected"
        }`}
      >
        <ArrowUp className={`size-4 ${value.trim() ? "text-white" : "text-primary"}`} />
      </button>
    </div>
  );
}
