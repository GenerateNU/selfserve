import { useState, useRef } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { House, ChevronRight, Search, X } from "lucide-react-native";
import { useGetDepartments } from "@shared/api/departments";
import type { Department } from "@shared";
import { Colors } from "@/constants/theme";

const ICON_COLOR = Colors.light.textSubtle;

type DepartmentPickerProps = {
  hotelId: string;
  value: Department | undefined;
  onChange: (department: Department | undefined) => void;
};

export function DepartmentPicker({
  hotelId,
  value,
  onChange,
}: DepartmentPickerProps) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<TextInput>(null);

  const { data: departments, isLoading } = useGetDepartments(
    expanded ? hotelId : undefined,
  );

  const filtered = (departments ?? []).filter((d) =>
    search ? d.name.toLowerCase().includes(search.toLowerCase()) : true,
  );

  function handleToggle() {
    const next = !expanded;
    setExpanded(next);
    setSearch("");
    if (next) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleSelect(department: Department) {
    onChange(value?.id === department.id ? undefined : department);
    setExpanded(false);
    setSearch("");
  }

  return (
    <View className="gap-2">
      <Pressable
        onPress={handleToggle}
        className="flex-row items-center justify-between h-6"
      >
        <View className="flex-row items-center gap-1">
          <House size={16} color={ICON_COLOR} />
          <Text className="text-[15px] text-text-subtle tracking-tight">
            Department
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text
            className={`text-[15px] tracking-tight ${value ? "text-text-default" : "text-text-subtle"}`}
          >
            {value?.name ?? "Select..."}
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
                  <Text className="text-[12px] text-text-default tracking-tight">
                    {value.name}
                  </Text>
                  <Pressable onPress={() => onChange(undefined)} hitSlop={4}>
                    <X size={10} color={ICON_COLOR} />
                  </Pressable>
                </View>
              )}
              <TextInput
                ref={inputRef}
                className="flex-1 text-[12px] text-text-default tracking-tight"
                placeholder="Search departments..."
                placeholderTextColor={ICON_COLOR}
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
              />
            </View>
          </View>

          {isLoading ? (
            <View className="px-4 py-3">
              <Text className="text-[12px] text-text-subtle tracking-tight">
                Loading...
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <View className="px-4 py-3">
              <Text className="text-[12px] text-text-subtle tracking-tight">
                No departments found
              </Text>
            </View>
          ) : (
            filtered.map((d) => (
              <Pressable
                key={d.id}
                onPress={() => handleSelect(d)}
                className={`px-4 py-2 ${value?.id === d.id ? "bg-bg-selected" : ""}`}
              >
                <Text className="text-[12px] text-text-default tracking-tight">
                  {d.name}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}
