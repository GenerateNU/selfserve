import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { ChevronDown, X, Check } from "lucide-react-native";
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
  const selectedOptions = options.filter((opt) => value?.includes(opt.value));
  const onTriggerPress = () => setIsOpen(!isOpen); 

  return (
    <View>
      <FilterTrigger
        placeholder={placeholder}
        isOpen={isOpen}
        onPress={onTriggerPress}
      />
      {isOpen && (
        <View className="bg-white border border-stroke-subtle rounded-b-xl overflow-hidden">
          <ScrollView className="max-h-[40vh]">
            {options.map((option, idx) => {
              const isSelected = value?.includes(option.value);
              const onPress = () => onChange(option.value)
              return (
                <FilterOptionRow 
                key={option.value}
                option={option}
                isSelected={isSelected}
                showBottomBorder={idx < options.length - 1}
                onPress={onPress}
                />
              );
            })}
          </ScrollView>
        </View>
      )}
      {selectedOptions.length > 0 && (
        <SelectedFilterOptions options={selectedOptions} onChange={onChange}/> 
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
          className={`flex-row items-center justify-between px-[4vw] h-[7vh] bg-white border border-stroke-subtle ${
            isOpen ? "rounded-t-xl border-b-0" : "rounded-xl"
          }`}
        >
          <Text className="text-[5vw] font-semibold text-black">
            {placeholder}
          </Text>
          <ChevronDown className="w-[5vw] h-[5vw]" color="#000000" />
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
      key={option.value}
      onPress={onPress}
      className={`flex-row items-center justify-between px-[4vw] py-[2.5vh] ${
        showBottomBorder ? "border-b border-shadow-weak" : ""
      } ${isSelected ? "bg-card" : "bg-white"}`}
    >
      <Text
        className={`text-[4.5vw] ${
          isSelected ? "font-medium text-black" : "text-black"
        }`}
      >
        {option.label}
      </Text>
      {isSelected && (
        <Check className="w-[4vw] h-[4vw]" color={Colors.dark.greenBorder} />
      )}
    </Pressable>
  );
}

function SelectedFilterOptions<T extends number | string>({
  options,
  onChange,
}: {
  options: Option<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-[2vw] mt-[2vh]">
        {options.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className="flex-row items-center gap-[1vw] bg-card border border-primary-border
             rounded-md px-[3vw] py-[1vh]"
          >
            <Text className="text-[3.5vw] text-black">{opt.label}</Text>
            <X className="w-[3vw] h-[3vw]" color={Colors.dark.greenBorder} />
          </Pressable>
        ))}
    </View>
  );
}