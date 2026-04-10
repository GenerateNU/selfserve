import { View, Text, Image } from "react-native";

type ProfileHeroProps = {
  firstName: string;
  lastName: string;
  avatarUrl: string | undefined;
};

export function ProfileHero({ firstName, lastName, avatarUrl }: ProfileHeroProps) {
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <View className="items-center py-8 gap-4">
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          className="w-24 h-24 rounded-full"
        />
      ) : (
        <View className="w-24 h-24 rounded-full bg-primary items-center justify-center">
          <Text className="text-4xl font-semibold text-white">{initial}</Text>
        </View>
      )}
      <View className="items-center gap-1">
        <Text className="text-2xl font-bold text-text-default">{displayName}</Text>
        <Text className="text-sm font-semibold text-primary">Hotel Chain</Text>
      </View>
    </View>
  );
}
