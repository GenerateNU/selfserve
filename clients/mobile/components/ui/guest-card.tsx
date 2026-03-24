import React from "react";
import { Pressable, View, Text } from "react-native";
import { User } from "lucide-react-native";
import { cn } from "@shared/utils";

interface GuestCardProps {
  firstName: string;
  lastName: string;
  floor: number;
  room: number;
  onPress: () => void;
}

export function GuestCard({
  firstName,
  lastName,
  floor,
  room,
  onPress,
}: GuestCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center p-[3vw] border border-stroke-subtle rounded-md "
    >
      <View className="flex-1">
        <Text className="bg-card text-[4vw] font-semibold text-black">
          {firstName + " " + lastName}
        </Text>

        <Text className="bg-card text-[3.5vw] text-black">
          Floor: {floor} Room: {room}
        </Text>
      </View>
    </Pressable>
  );
}
