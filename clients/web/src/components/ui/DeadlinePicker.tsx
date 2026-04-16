import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight, Clock, RefreshCw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type TimeSlot = { hour: number; minute: number };

const TIME_SLOTS: TimeSlot[] = Array.from({ length: 17 }, (_, h) =>
  [0, 15, 30, 45].map((m) => ({ hour: h + 6, minute: m })),
).flat();

type DeadlinePickerProps = {
  selectedDate?: Date;
  onSelect: (date: Date | undefined) => void;
};

export function DeadlinePicker({ selectedDate, onSelect }: DeadlinePickerProps) {
  const [open, setOpen] = useState(false);
  const today = new Date();

  const [tempDate, setTempDate] = useState<Date | undefined>(selectedDate);
  const [tempTime, setTempTime] = useState<TimeSlot | undefined>();
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const [month, setMonth] = useState(selectedDate ?? today);

  function handleClear() {
    setTempDate(undefined);
    setTempTime(undefined);
    onSelect(undefined);
  }

  function handleConfirm() {
    if (!tempDate) return;
    const result = new Date(tempDate);
    if (tempTime) {
      let h = tempTime.hour % 12;
      if (period === "PM") h += 12;
      result.setHours(h, tempTime.minute, 0, 0);
    }
    onSelect(result);
    setOpen(false);
  }

  const hasTime =
    !!selectedDate &&
    (selectedDate.getHours() !== 0 || selectedDate.getMinutes() !== 0);

  const triggerLabel = selectedDate
    ? hasTime
      ? selectedDate.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : selectedDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
    : "Empty";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "rounded-md px-2 py-1 text-sm transition-colors hover:bg-bg-selected",
          selectedDate ? "text-text-default" : "text-text-subtle",
        )}
      >
        {triggerLabel}
      </PopoverTrigger>

      <PopoverContent align="start" side="bottom" sideOffset={6} className="w-[26rem] overflow-hidden rounded-xl border border-stroke-subtle p-0 shadow-lg">
        {/* Static header */}
        <div className="flex items-center justify-between border-b border-stroke-subtle px-4 py-3">
          <span className="text-sm text-text-subtle">Select Deadline</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-text-subtle hover:text-text-default"
          >
            Clear
          </button>
        </div>

        {/* Calendar */}
        <DayPicker
          mode="single"
          selected={tempDate}
          onSelect={setTempDate}
          month={month}
          onMonthChange={setMonth}
          components={{
            MonthCaption: ({ calendarMonth }) => (
              <div className="mb-1 flex items-center justify-between px-2 py-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setMonth(
                      new Date(
                        calendarMonth.date.getFullYear(),
                        calendarMonth.date.getMonth() - 1,
                        1,
                      ),
                    )
                  }
                  className="rounded p-0.5 hover:bg-bg-selected"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-sm font-medium">
                  {calendarMonth.date.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setMonth(
                      new Date(
                        calendarMonth.date.getFullYear(),
                        calendarMonth.date.getMonth() + 1,
                        1,
                      ),
                    )
                  }
                  className="rounded p-0.5 hover:bg-bg-selected"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            ),
            Nav: () => <span />,
          }}
          classNames={{
            root: "px-4 pb-2 pt-1",
            months: "flex flex-col",
            month: "flex flex-col gap-2",
            month_caption: "",
            caption_label: "",
            nav: "",
            button_previous: "",
            button_next: "",
            month_grid: "w-full border-collapse",
            weekdays: "flex",
            weekday: "flex-1 py-1 text-center text-xs font-medium text-text-subtle",
            week: "flex mt-1",
            day: "flex-1 text-center",
            day_button: "w-full rounded-full py-1 text-sm transition-colors hover:bg-bg-selected",
            selected: "[&>button]:bg-primary [&>button]:text-white [&>button]:hover:bg-primary-hover",
            today: "[&>button]:font-medium [&>button]:text-primary",
            outside: "[&>button]:text-text-subtle opacity-40",
            disabled: "opacity-30",
            hidden: "invisible",
          }}
        />

        {/* Time selector */}
        <div className="border-t border-stroke-subtle px-3 pt-2">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-text-subtle">
              <Clock className="size-4" />
              Select Time
            </div>
            <div className="flex overflow-hidden rounded-md border border-stroke-subtle">
              {(["AM", "PM"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-2.5 py-0.5 text-xs font-medium transition-colors",
                    period === p
                      ? "bg-primary text-white"
                      : "text-text-subtle hover:text-text-default",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="grid max-h-28 grid-cols-4 gap-1 overflow-y-auto pb-2">
            {TIME_SLOTS.map((slot) => {
              const label = `${slot.hour % 12 || 12}:${slot.minute.toString().padStart(2, "0")}`;
              const isSelected =
                tempTime?.hour === slot.hour && tempTime?.minute === slot.minute;
              return (
                <button
                  key={`${slot.hour}-${slot.minute}`}
                  type="button"
                  onClick={() => setTempTime(slot)}
                  className={cn(
                    "rounded border border-stroke-subtle px-1 py-1 text-xs transition-colors hover:bg-bg-selected",
                    isSelected &&
                      "border-primary bg-primary text-white hover:bg-primary-hover",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recurring row */}
        <div className="flex items-center justify-between border-t border-stroke-subtle px-3 py-2">
          <div className="flex items-center gap-1.5 text-sm text-text-subtle">
            <RefreshCw className="size-4" />
            Recurring
          </div>
          <ChevronRight className="size-4 text-text-subtle" />
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-stroke-subtle p-3">
          <Button className="flex-1" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            disabled={!tempDate}
            onClick={handleConfirm}
          >
            Select
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
