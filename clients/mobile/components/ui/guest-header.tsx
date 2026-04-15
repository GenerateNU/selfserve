import { View, Text, Pressable } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";

export type Tab = "profile" | "requests";

interface GuestHeaderProps {
  name: string;
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  hasUrgent?: boolean;
}

export function GuestHeader({
  name,
  activeTab,
  onTabChange,
  hasUrgent,
}: GuestHeaderProps) {
  return (
    <View className="pt-safe">
      <View className="flex-row items-center px-[4vw] py-[3vh]">
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.light.text} />
        </Pressable>
        <Text className="flex-1 text-center text-[5vw] font-semibold text-black">
          {name}
        </Text>
        <View className="w-[6vw]" />
      </View>

      <View className="flex-row border-b border-stroke-subtle">
        {(["profile", "requests"] as Tab[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => onTabChange(tab)}
            className="relative flex-1 items-center py-[1.5vh]"
          >
            <View className="flex-row items-center gap-[1.5vw]">
              <Text
                className={`text-[3.5vw] font-medium ${
                  activeTab === tab ? "text-primary" : "text-text-subtle"
                }`}
              >
                {tab === "profile" ? "Profile" : "Requests"}
              </Text>
              {tab === "requests" && hasUrgent && (
                <View className="w-[4vw] h-[4vw] rounded-full bg-danger items-center justify-center">
                  <Text className="text-white text-[2.5vw] font-bold">!</Text>
                </View>
              )}
            </View>
            {activeTab === tab && (
              <View className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}
