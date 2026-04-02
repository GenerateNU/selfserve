import { Pressable, View, Text } from "react-native";

interface GuestCardProps {
  firstName: string;
  lastName: string;
  floor: number;
  room: number;
  groupSize?: number;
  onPress: () => void;
}

export function GuestCard({ firstName, lastName, floor, room, groupSize, onPress }: GuestCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-[4vw] py-[2vh] border-b border-stroke-subtle bg-white"
    >
      <View className="flex-1 gap-[1vh] pl-[2vw]">
        <Text className="text-[4.5vw] font-semibold text-black">
          {firstName} {lastName}
        </Text>
        <View className="flex-row gap-[2vw]">
          <View className="bg-card rounded-md px-[2.5vw] py-[0.5vh]">
            <Text className="text-primary text-[3vw] font-medium">Floor {floor}</Text>
          </View>
          <View className="bg-card rounded-md px-[2.5vw] py-[0.5vh]">
            <Text className="text-primary text-[3vw] font-medium">Room {room}</Text>
          </View>
          {groupSize !== undefined && (
            <View className="bg-card rounded-md px-[2.5vw] py-[0.5vh]">
              <Text className="text-primary text-[3vw] font-medium">Group {groupSize}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}