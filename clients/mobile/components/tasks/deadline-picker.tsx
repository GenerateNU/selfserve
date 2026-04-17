import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  CalendarSync,
  ChevronLeft,
  ChevronRight,
  Clock4,
} from "lucide-react-native";
import { Colors } from "@/constants/theme";

const { tabBarActive: PRIMARY, textSubtle: ICON_COLOR, borderLight: BORDER_LIGHT } =
  Colors.light;

const WEEK_DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstWeekday(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function buildDate(
  day: number,
  year: number,
  month: number,
  hour: number,
  minute: number,
  ampm: "AM" | "PM",
): Date {
  const d = new Date(year, month, day);
  let hours = hour % 12;
  if (ampm === "PM") hours += 12;
  d.setHours(hours, minute, 0, 0);
  return d;
}

type DeadlinePickerProps = {
  value?: Date;
  onChange: (date: Date | undefined) => void;
};

export function DeadlinePicker({ value, onChange }: DeadlinePickerProps) {
  const now = new Date();

  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"date" | "time">("date");
  const [viewMonth, setViewMonth] = useState(value?.getMonth() ?? now.getMonth());
  const [viewYear, setViewYear] = useState(value?.getFullYear() ?? now.getFullYear());

  // Sync calendar view when value changes from outside (e.g. pre-population)
  useEffect(() => {
    if (value) {
      setViewMonth(value.getMonth());
      setViewYear(value.getFullYear());
    }
  }, [value]);

  // Derive selection and time entirely from value
  const selDay = value?.getDate();
  const selMonth = value?.getMonth();
  const selYear = value?.getFullYear();
  const hour = value ? (value.getHours() % 12 || 12) : 12;
  const minute = value ? Math.round(value.getMinutes() / 5) * 5 : 0;
  const ampm: "AM" | "PM" = value ? (value.getHours() >= 12 ? "PM" : "AM") : "AM";

  function handleDayPress(day: number) {
    onChange(buildDate(day, viewYear, viewMonth, hour, minute, ampm));
  }

  function handleHourChange(h: number) {
    const base = value ?? new Date(viewYear, viewMonth, now.getDate());
    onChange(buildDate(base.getDate(), base.getFullYear(), base.getMonth(), h, minute, ampm));
  }

  function handleMinuteChange(m: number) {
    const base = value ?? new Date(viewYear, viewMonth, now.getDate());
    onChange(buildDate(base.getDate(), base.getFullYear(), base.getMonth(), hour, m, ampm));
  }

  function handleAmpmChange(ap: "AM" | "PM") {
    const base = value ?? new Date(viewYear, viewMonth, now.getDate());
    onChange(buildDate(base.getDate(), base.getFullYear(), base.getMonth(), hour, minute, ap));
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstWeekday = getFirstWeekday(viewYear, viewMonth);
  const cells: Array<number | null> = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const triggerLabel = value
    ? value.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : undefined;

  return (
    <View className="gap-2">
      {/* Trigger row */}
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        className="flex-row items-center justify-between h-6"
      >
        <View className="flex-row items-center gap-1">
          <Clock4 size={16} color={ICON_COLOR} />
          <Text className="text-[15px] text-text-subtle tracking-tight">
            Deadline
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text
            className={`text-[15px] tracking-tight ${triggerLabel ? "text-text-default" : "text-text-subtle"}`}
          >
            {triggerLabel ?? "Select..."}
          </Text>
          <ChevronRight
            size={14}
            color={ICON_COLOR}
            style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }}
          />
        </View>
      </Pressable>

      {expanded && (
        <View className="rounded overflow-hidden">
          {/* Tab bar */}
          <View
            className="flex-row"
            style={{ borderBottomWidth: 1, borderBottomColor: BORDER_LIGHT }}
          >
            {(["date", "time"] as const).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                className="flex-1 items-center py-2.5"
                style={
                  activeTab === tab
                    ? {
                        borderBottomWidth: 2,
                        borderBottomColor: PRIMARY,
                        marginBottom: -1,
                      }
                    : undefined
                }
              >
                <Text
                  className="text-[14px] font-medium tracking-tight"
                  style={{ color: activeTab === tab ? PRIMARY : ICON_COLOR }}
                >
                  {tab === "date" ? "Today" : "Time"}
                </Text>
              </Pressable>
            ))}
          </View>

          {activeTab === "date" ? (
            <View className="px-3 pt-3 pb-1">
              {/* Month navigation */}
              <View className="flex-row items-center justify-between mb-3">
                <Pressable onPress={prevMonth} hitSlop={8}>
                  <ChevronLeft size={18} color={ICON_COLOR} />
                </Pressable>
                <Text className="text-[15px] font-semibold text-text-default tracking-tight">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </Text>
                <Pressable onPress={nextMonth} hitSlop={8}>
                  <ChevronRight size={18} color={ICON_COLOR} />
                </Pressable>
              </View>

              {/* Weekday headers */}
              <View className="flex-row mb-1">
                {WEEK_DAYS.map((d) => (
                  <View key={d} className="flex-1 items-center">
                    <Text className="text-[11px] text-text-subtle tracking-tight">
                      {d}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Day grid */}
              {Array.from({ length: cells.length / 7 }, (_, row) => (
                <View key={row} className="flex-row">
                  {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
                    const isSelected =
                      day !== null &&
                      selDay === day &&
                      selMonth === viewMonth &&
                      selYear === viewYear;
                    const isToday =
                      day !== null &&
                      day === now.getDate() &&
                      viewMonth === now.getMonth() &&
                      viewYear === now.getFullYear();
                    return (
                      <Pressable
                        key={col}
                        onPress={day !== null ? () => handleDayPress(day) : undefined}
                        className="flex-1 items-center py-1.5"
                        style={
                          isSelected
                            ? { backgroundColor: PRIMARY, borderRadius: 999 }
                            : undefined
                        }
                      >
                        {day !== null && (
                          <Text
                            className="text-[13px] tracking-tight"
                            style={{
                              color: isSelected ? Colors.light.white : isToday ? PRIMARY : Colors.light.textDefault,
                              fontWeight: isSelected || isToday ? "600" : "400",
                            }}
                          >
                            {day}
                          </Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          ) : (
            <View className="flex-row items-center h-28 overflow-hidden">
              {/* Hours */}
              <Picker
                selectedValue={hour}
                onValueChange={(v) => handleHourChange(Number(v))}
                style={{ flex: 1, backgroundColor: "transparent" }}
                itemStyle={{ fontSize: 17, color: Colors.light.textDefault }}
              >
                {HOURS.map((h) => (
                  <Picker.Item key={h} label={String(h)} value={h} />
                ))}
              </Picker>

              {/* Colon separator */}
              <Text className="text-[22px] font-semibold text-text-default mx-0.5">
                :
              </Text>

              {/* Minutes */}
              <Picker
                selectedValue={minute}
                onValueChange={(v) => handleMinuteChange(Number(v))}
                style={{ flex: 1, backgroundColor: "transparent" }}
                itemStyle={{ fontSize: 17, color: Colors.light.textDefault }}
              >
                {MINUTES.map((m) => (
                  <Picker.Item
                    key={m}
                    label={String(m).padStart(2, "0")}
                    value={m}
                  />
                ))}
              </Picker>

              {/* AM/PM */}
              <Picker
                selectedValue={ampm}
                onValueChange={(v) => handleAmpmChange(v as "AM" | "PM")}
                style={{ flex: 1, backgroundColor: "transparent" }}
                itemStyle={{ fontSize: 17, color: Colors.light.textDefault }}
              >
                <Picker.Item label="AM" value="AM" />
                <Picker.Item label="PM" value="PM" />
              </Picker>
            </View>
          )}

          {/* Reoccurring row — placeholder */}
          <View className="flex-row items-center justify-between px-3 py-2">
            <View className="flex-row items-center gap-1">
              <CalendarSync size={14} color={ICON_COLOR} />
              <Text className="text-[13px] text-text-subtle tracking-tight">
                Reoccurring
              </Text>
            </View>
            <Text className="text-[13px] text-text-subtle tracking-tight">
              None
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
