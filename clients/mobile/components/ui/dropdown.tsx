import { useState } from "react";
import { Filter } from "./filters";
import { View, Text, Pressable, Modal } from 'react-native';
import { ChevronDown } from 'lucide-react-native';


export function Dropdown<T>({ value, onChange, options, placeholder, emptyValue }: Filter<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View className="flex-1">
      <Pressable
        onPress={() => setIsOpen(true)}
        className="border border-gray-300 rounded-md h-[6vh] px-[3vw] flex-row items-center justify-between"
      >
        <Text className="text-[4vw] text-gray-900">
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown className="w-[4vw] h-[4vw]" color="#000" />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center px-[4vw]"
          onPress={() => setIsOpen(false)}
        >
          <View className="bg-white rounded-md">
            <Pressable
              onPress={() => {
                onChange(emptyValue);
                setIsOpen(false);
              }}
              className="p-[4vw] border-b border-gray-300"
            >
              <Text className="text-[4vw]">{placeholder}</Text>
            </Pressable>
            {options.map((option, idx) => (
              <Pressable
                key={idx}
                onPress={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="p-[4vw] border-b border-gray-300"
              >
                <Text className="text-[4vw]">{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}