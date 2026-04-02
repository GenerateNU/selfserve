import { View, Text, Pressable } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";

export type Tab = "profile" | "activity";

interface GuestHeaderProps {
  name: string;
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
}

export function GuestHeader({
  name,
  activeTab,
  onTabChange,
}: GuestHeaderProps) {
  return (
    <View>
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
        {(["profile", "activity"] as Tab[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => onTabChange(tab)}
            className={`flex-1 py-[1.5vh] items-center ${
              activeTab === tab ? "bg-success-accent" : "bg-white"
            }`}
          >
            <Text
              className={`text-[3.5vw] font-medium ${
                activeTab === tab ? "text-primary" : "text-shadow-strong"
              }`}
            >
              {tab === "profile" ? "Profile" : "Visit Activity"}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
