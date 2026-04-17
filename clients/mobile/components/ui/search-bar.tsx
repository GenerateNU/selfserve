import React from "react";
import { View, TextInput, Pressable } from "react-native";
import { Search, X } from "lucide-react-native";
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
    <View className="flex-row items-center border border-stroke-subtle rounded-lg px-[10px] py-2 gap-1">
      <Search size={14} color={Colors.light.iconDisabled} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.light.iconDisabled}
        className="flex-1 text-sm text-text-default"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText("")} hitSlop={8}>
          <X size={16} color={Colors.light.iconDisabled} />
        </Pressable>
      )}
    </View>
  );
}
