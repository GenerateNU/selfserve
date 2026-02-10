import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { User } from 'lucide-react-native';

interface GuestCardProps {
  name: string;
  floor: number;
  room: number;
  group: number;
  onPress: () => void;
  className?: string;
}

export function GuestCard({ name, floor, room, group, onPress, className }: GuestCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center p-[3vw] border border-gray-300 rounded-md active:bg-gray-100 ${className || ''}`}
    >
      <View className="w-[10vw] h-[10vw] rounded-full border-2 border-gray-400 items-center justify-center mr-[3vw]">
        <User className="w-[6vw] h-[6vw]" color="#374151" />
      </View>

      <View className="flex-1">
        <Text className="text-[4vw] font-semibold text-gray-900">
          {name}
        </Text>
        <Text className="text-[3.5vw] text-gray-600">
          Floor: {floor}  Room: {room}  Group: {group}
        </Text>
      </View>
    </Pressable>
  );
}