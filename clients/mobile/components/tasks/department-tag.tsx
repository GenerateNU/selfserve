import Feather from "@expo/vector-icons/Feather";
import { Text, View } from "react-native";

type DepartmentTagProps = {
  name: string;
};

export function DepartmentTag({ name }: DepartmentTagProps) {
  return (
    <View className="bg-bg-input flex-row items-center gap-2 px-2 py-1 rounded">
      <Feather name="home" size={12} color="#464646" />
      <Text className="text-text-secondary text-xs" numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}
