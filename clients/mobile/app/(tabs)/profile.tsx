import { View, Text, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useGetUser } from "@shared";
import LogoutButton from "@/components/Logout";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileInfoCard } from "@/components/profile/ProfileInfoCard";
import { useProfilePicture } from "@/hooks/use-profile-picture";

export default function Profile() {
  const { userId } = useAuth();
  const { data: user, isLoading } = useGetUser(userId ?? undefined);
  const {
    profilePicUrl,
    status,
    isLoading: isPicLoading,
    isInitialLoading: isPicInitialLoading,
    pickAndUpload,
    handleRemove,
  } = useProfilePicture(userId ?? undefined);

  const onSignOut = () => {
    router.replace("/sign-in");
  };

  const firstName = user?.first_name ?? "";
  const lastName = user?.last_name ?? "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || "User";

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={["top"]}>
      <View className="px-4 py-4 border-b border-stroke-subtle">
        <Text className="text-2xl font-semibold text-text-default">
          Profile
        </Text>
        <Text className="text-sm text-text-subtle">Overview of profile</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerClassName="pb-12">
          <ProfileHero
            firstName={firstName}
            lastName={lastName}
            avatarUrl={
              (!isPicInitialLoading && profilePicUrl) ||
              user?.profile_picture ||
              undefined
            }
            onAvatarPress={() => void pickAndUpload()}
            isAvatarBusy={isPicLoading}
          />
          <View className="px-4 flex-row gap-3 justify-center">
            <Pressable
              onPress={() => void handleRemove()}
              disabled={
                isPicLoading ||
                (!profilePicUrl && !user?.profile_picture)
              }
              className="py-2 px-4 rounded-lg border border-stroke-default opacity-100 disabled:opacity-40"
            >
              <Text className="text-sm text-text-default">Remove photo</Text>
            </Pressable>
          </View>
          {status ? (
            <Text
              className={`text-xs text-center mt-2 px-6 ${
                status.startsWith("Error") ? "text-danger" : "text-text-subtle"
              }`}
            >
              {status}
            </Text>
          ) : null}
          <ProfileInfoCard
            governmentName={displayName}
            email={user?.primary_email ?? "—"}
            phoneNumber={user?.phone_number ?? "—"}
            department={user?.department ?? "—"}
          />
          <View className="px-4 mt-8">
            <LogoutButton onSignOut={onSignOut} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
