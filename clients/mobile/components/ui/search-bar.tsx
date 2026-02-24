import React from 'react';
import { View, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = "Search Guests" }: SearchBarProps) {
  return (
    <View className="relative">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        className="w-full h-[6vh] px-[4vw] pr-[12vw] border border-gray-300 rounded-md"
      />
      <View className="absolute right-[4vw] top-0 h-full justify-center w-[5vw] h-[5vw]">
        <Search className="w-full h-full" color="#9CA3AF" />
      </View>
    </View>
  );
}