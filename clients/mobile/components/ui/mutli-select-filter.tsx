import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { ChevronDown, Check } from "lucide-react-native";
import { Filter } from "./filters";
import { Colors } from "@/constants/theme";

type Option<T extends string | number> = {
  label: string;
  value: T;
};

export function MultiSelectFilter<T extends string | number>({
  value,
  onChange,
  options,
  placeholder,
}: Filter<T>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View>
      <FilterTrigger
        placeholder={placeholder}
        isOpen={isOpen}
        onPress={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <View className="bg-white border border-stroke-subtle rounded-b-xl overflow-hidden max-h-[40vh]">
          <ScrollView>
            {options.map((option, idx) => {
      const isSelected = value?.includes(option.value as T);
              return (
                <FilterOptionRow
                  key={option.value}
                  option={option}
                  isSelected={isSelected}
                  showBottomBorder={idx < options.length - 1}
                  onPress={() => onChange(option.value)}
                />
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function FilterTrigger({
  placeholder,
  isOpen,
  onPress,
}: {
  placeholder: string;
  isOpen: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center justify-between px-[3vw] h-[5vh] bg-white border border-stroke-subtle ${
        isOpen ? "rounded-t-xl border-b-0" : "rounded-xl"
      }`}
    >
      <Text className="text-[3.5vw] font-semibold text-black">{placeholder}</Text>
      <ChevronDown size={14} color="#000000" />
    </Pressable>
  );
}

function FilterOptionRow<T extends number | string>({
  option,
  isSelected,
  showBottomBorder,
  onPress,
}: {
  option: Option<T>;
  isSelected: boolean;
  showBottomBorder: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center justify-between px-[4vw] py-[1.2vh] ${
        showBottomBorder ? "border-b border-shadow-weak" : ""
      } ${isSelected ? "bg-card" : "bg-white"}`}
    >
      <Text className={`text-[3.5vw] ${isSelected ? "font-medium text-black" : "text-black"}`}>
        {option.label}
      </Text>
      {isSelected && (
        <Check size={14} color={Colors.dark.greenBorder} />
      )}
    </Pressable>
  );
}