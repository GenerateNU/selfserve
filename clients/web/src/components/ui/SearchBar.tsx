import type { InputHTMLAttributes, ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchBarProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
  icon?: ReactNode;
};

export function SearchBar({
  value,
  onChange,
  placeholder = "Search for a room...",
  className,
  inputClassName,
  iconClassName,
  icon,
  ...inputProps
}: SearchBarProps) {
  return (
    <label
      className={cn(
        "flex w-full items-center justify-between rounded-[4px] border border-stroke-subtle bg-bg-primary px-3 py-2",
        className,
      )}
    >
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full bg-transparent text-sm leading-tight text-text-default outline-none placeholder:text-text-subtle",
          inputClassName,
        )}
        {...inputProps}
      />
      <span
        className={cn("ml-2 flex shrink-0 items-center text-text-subtle", iconClassName)}
      >
        {icon ?? <Search className="h-[18px] w-[18px]" strokeWidth={2} />}
      </span>
    </label>
  );
}
