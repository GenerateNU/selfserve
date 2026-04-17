import { View, Text, Image, Pressable, ActivityIndicator } from "react-native";
import { Pencil } from "lucide-react-native";

type ProfileHeroProps = {
  firstName: string;
  lastName: string;
  avatarUrl: string | undefined;
  /** When set, tapping the avatar opens the picker / upload flow. */
  onAvatarPress?: () => void;
  isAvatarBusy?: boolean;
};

export function ProfileHero({
  firstName,
  lastName,
  avatarUrl,
  onAvatarPress,
  isAvatarBusy = false,
}: ProfileHeroProps) {
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || "User";
  const initial = displayName.charAt(0).toUpperCase();

  const avatarInner = avatarUrl ? (
    <Image source={{ uri: avatarUrl }} className="w-24 h-24 rounded-full" />
  ) : (
    <View className="w-24 h-24 rounded-full bg-primary items-center justify-center">
      <Text className="text-4xl font-semibold text-white">{initial}</Text>
    </View>
  );

  return (
    <View className="items-center py-8 gap-4">
      {onAvatarPress ? (
        <Pressable
          onPress={onAvatarPress}
          disabled={isAvatarBusy}
          className="relative"
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
        >
          {avatarInner}
          {isAvatarBusy ? (
            <View className="absolute inset-0 rounded-full bg-black/40 items-center justify-center">
              <ActivityIndicator color="#fff" />
            </View>
          ) : null}
          {!isAvatarBusy ? (
            <View className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary border-2 border-bg-primary items-center justify-center">
              <Pencil size={14} color="#ffffff" />
            </View>
          ) : null}
        </Pressable>
      ) : (
        avatarInner
      )}
      <View className="items-center gap-1">
        <Text className="text-2xl font-bold text-text-default">
          {displayName}
        </Text>
        <Text className="text-sm font-semibold text-primary">Hotel Chain</Text>
      </View>
    </View>
  );
}
