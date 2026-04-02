import React from "react";
import { View, TextInput } from "react-native";
import { Search } from "lucide-react-native";
import { Colors } from "@/constants/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search Guests",
}: SearchBarProps) {
  return (
    <View className="relative">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.light.text}
        className="w-full h-[8vh] px-[4vw] pr-[12vw] rounded-xl border border-stroke-subtle text-[4.5vw]"

      />
      <View className="absolute right-[4vw] top-0 h-full justify-center w-[5vw] h-[5vw]">
        <Search className="w-full h-full" color={Colors.light.text} />
      </View>
    </View>
  );
}