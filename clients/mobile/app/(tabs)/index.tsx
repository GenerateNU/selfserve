import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { Sparkles, ClipboardList, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";

function SelectionBox({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between bg-white rounded-lg p-4"
      style={{ borderWidth: 0.5, borderColor: "#aeaeae", borderRadius: 8 }}
    >
      <View className="flex-row items-center gap-2">
        {icon}
        <Text className="text-[15px] text-text-default tracking-tight">
          {label}
        </Text>
      </View>
      <ChevronRight size={18} color="#aeaeae" />
    </Pressable>
  );
}

export default function CreateTaskScreen() {
  const { user } = useUser();
  const firstName = user?.firstName ?? "there";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pb-3 pt-3 border-b border-[#e9e9e9]">
        <Text className="text-2xl font-medium text-text-default tracking-tight">
          Task Creation
        </Text>
      </View>

      {/* Content */}
      <View className="px-6 pt-8 gap-6">
        <View className="gap-2">
          <Text className="text-2xl font-medium text-text-default tracking-tight">
            Welcome Back, {firstName}!
          </Text>
          <Text className="text-[15px] text-text-default">
            How would you like to get started today?
          </Text>
        </View>

        <View className="gap-4">
          <SelectionBox
            icon={<Sparkles size={20} color="#15502c" />}
            label="Use SelfServe's AI"
            onPress={() => router.push("/create-task-ai")}
          />
          <SelectionBox
            icon={<ClipboardList size={20} color="#15502c" />}
            label="Manually Create Task"
            onPress={() => router.push("/create-task-manual")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
