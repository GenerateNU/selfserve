import { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  Modal,
} from "react-native";
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
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const shouldSkipNextPressRef = useRef(false);
  const closePreview = () => {
    shouldSkipNextPressRef.current = false;
    setIsPreviewVisible(false);
  };
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || "User";
  const initial = displayName.charAt(0).toUpperCase();

  const avatarInner = (
    <View className="w-24 h-24 rounded-full overflow-hidden bg-bg-container border border-stroke-subtle items-center justify-center">
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} className="w-full h-full" />
      ) : (
        <View className="w-full h-full bg-primary items-center justify-center">
          <Text className="text-4xl font-semibold text-white">{initial}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View className="items-center py-8 gap-4">
      {onAvatarPress ? (
        <Pressable
          onPress={() => {
            if (shouldSkipNextPressRef.current) {
              shouldSkipNextPressRef.current = false;
              return;
            }
            onAvatarPress();
          }}
          onLongPress={() => {
            if (!avatarUrl || isAvatarBusy) return;
            shouldSkipNextPressRef.current = true;
            setIsPreviewVisible(true);
          }}
          disabled={isAvatarBusy}
          delayLongPress={220}
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
      {avatarUrl ? (
        <Modal
          visible={isPreviewVisible}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={closePreview}
        >
          <Pressable
            className="flex-1 bg-black/75 items-center justify-center px-6"
            onPress={closePreview}
          >
            <Pressable onPress={() => {}}>
              <View className="w-[320px] h-[320px] max-w-full rounded-full overflow-hidden border border-white/20">
                <Image source={{ uri: avatarUrl }} className="w-full h-full" />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
      <View className="items-center gap-1">
        <Text className="text-2xl font-bold text-text-default">
          {displayName}
        </Text>
        <Text className="text-sm font-semibold text-primary">Hotel Chain</Text>
      </View>
    </View>
  );
}
