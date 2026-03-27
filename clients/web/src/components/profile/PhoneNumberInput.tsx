export type PhoneNumberInputProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
};

export function formatPhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function unformatPhoneNumber(formatted: string): string {
  return formatted.replace(/\D/g, "");
}

export function PhoneNumberInput({ value, onChange, onKeyDown }: PhoneNumberInputProps) {
  const formatted = formatPhoneNumber(unformatPhoneNumber(value));

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const digits = unformatPhoneNumber(e.target.value);
    onChange(digits);
  };

  return (
    <input
      autoFocus
      type="tel"
      value={formatted}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      placeholder="(555) 555-5555"
      className="text-sm text-text-subtle border-b pb-0.5 border-stroke-default bg-transparent outline-none"
    />
  );
}
