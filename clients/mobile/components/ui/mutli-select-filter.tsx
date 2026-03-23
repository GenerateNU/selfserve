import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { ChevronDown, X, Check } from "lucide-react-native";
import { Filter } from "./filters";
import { Colors } from "@/constants/theme";



export function MultiSelectFilter<T extends string | number>({
  value,
  onChange,
  options,
  placeholder,
}: Filter<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOptions = options.filter((opt) => value?.includes(opt.value));

  return (
    <View>
      <Pressable
        onPress={() => setIsOpen(!isOpen)}
        className={`flex-row items-center justify-between px-[4vw] h-[7vh] bg-white border border-stroke-subtle ${
          isOpen ? "rounded-t-xl border-b-0" : "rounded-xl"
        }`}
      >
        <Text className="text-[5vw] font-semibold text-black">
          {placeholder}
        </Text>
        <ChevronDown className="w-[5vw] h-[5vw]" color="#000000" />
      </Pressable>

      {isOpen && (
        <View className="bg-white border border-stroke-subtle rounded-b-xl overflow-hidden">
          <ScrollView className="max-h-[40vh]">
            {options.map((option, idx) => {
              const isSelected = value?.includes(option.value);
              return (
                <Pressable
                  key={option.value}
                  onPress={() => onChange(option.value)}
                  className={`flex-row items-center justify-between px-[4vw] py-[2.5vh] ${
                    idx < options.length - 1 ? "border-b border-shadow-weak" : ""
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
            })}
          </ScrollView>
        </View>
      )}
      {selectedOptions.length > 0 && (
        <View className="flex-row flex-wrap gap-[2vw] mt-[2vh]">
          {selectedOptions.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              className="flex-row items-center gap-[1vw] bg-card border border-primary-border rounded-md px-[3vw] py-[1vh]"
            >
              <Text className="text-[3.5vw] text-black">{opt.label}</Text>
              <X className="w-[3vw] h-[3vw]" color={Colors.dark.greenBorder} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}