import { useRef, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { ChevronRight, Search, X } from "lucide-react-native";
import type { TextInputProps } from "react-native";
import { Colors } from "@/constants/theme";

const ICON_COLOR = Colors.light.textSubtle;

type SearchPickerProps<T> = {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: T | undefined;
  onChange: (item: T | undefined) => void;
  getKey: (item: T) => string;
  getTriggerLabel: (item: T) => string;
  getChipLabel: (item: T) => string;
  renderRow: (item: T) => React.ReactNode;
  items: T[];
  isLoading: boolean;
  search: string;
  onSearch: (q: string) => void;
  onExpandChange?: (expanded: boolean) => void;
  searchPlaceholder?: string;
  keyboardType?: TextInputProps["keyboardType"];
  emptyMessage?: string;
};

export function SearchPicker<T>({
  icon: Icon,
  label,
  value,
  onChange,
  getKey,
  getTriggerLabel,
  getChipLabel,
  renderRow,
  items,
  isLoading,
  search,
  onSearch,
  onExpandChange,
  searchPlaceholder = "Search...",
  keyboardType = "default",
  emptyMessage = "No results found",
}: SearchPickerProps<T>) {
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<TextInput>(null);

  function handleToggle() {
    const next = !expanded;
    setExpanded(next);
    onSearch("");
    onExpandChange?.(next);
    if (next) setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleSelect(item: T) {
    onChange(value && getKey(value) === getKey(item) ? undefined : item);
    setExpanded(false);
    onSearch("");
    onExpandChange?.(false);
  }

  const triggerLabel = value ? getTriggerLabel(value) : undefined;

  return (
    <View className="gap-2">
      <Pressable
        onPress={handleToggle}
        className="flex-row items-center justify-between h-6"
      >
        <View className="flex-row items-center gap-1">
          <Icon size={16} color={ICON_COLOR} />
          <Text className="text-[15px] text-text-subtle tracking-tight">
            {label}
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
        <View className="rounded border border-input-border">
          <View className="flex-row items-center gap-2.5 px-2 py-2 border-b border-input-border-light">
            <Search size={17} color={ICON_COLOR} />
            <View className="flex-row items-center flex-1 gap-1">
              {value && (
                <View className="flex-row items-center gap-1 bg-bg-selected rounded px-1.5 py-0.5">
                  <Text className="text-xs text-text-default tracking-tight">
                    {getChipLabel(value)}
                  </Text>
                  <Pressable onPress={() => onChange(undefined)} hitSlop={4}>
                    <X size={10} color={ICON_COLOR} />
                  </Pressable>
                </View>
              )}
              <TextInput
                ref={inputRef}
                className="flex-1 text-xs text-text-default tracking-tight"
                placeholder={searchPlaceholder}
                placeholderTextColor={ICON_COLOR}
                value={search}
                onChangeText={onSearch}
                keyboardType={keyboardType}
                returnKeyType="search"
              />
            </View>
          </View>

          {isLoading ? (
            <View className="px-4 py-3">
              <Text className="text-xs text-text-subtle tracking-tight">
                Loading...
              </Text>
            </View>
          ) : items.length === 0 ? (
            <View className="px-4 py-3">
              <Text className="text-xs text-text-subtle tracking-tight">
                {emptyMessage}
              </Text>
            </View>
          ) : (
            items.map((item) => (
              <Pressable
                key={getKey(item)}
                onPress={() => handleSelect(item)}
                className={`px-4 py-2 ${value && getKey(value) === getKey(item) ? "bg-bg-selected" : ""}`}
              >
                {renderRow(item)}
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}
