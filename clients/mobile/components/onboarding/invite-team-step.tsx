import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check } from "lucide-react-native";
import { cn } from "@/lib/utils";
import type { OnboardingFormData } from "./types";

type InviteTeamStepProps = {
  formData: OnboardingFormData;
  updateForm: (updates: Partial<OnboardingFormData>) => void;
  onComplete: () => void;
};

export function InviteTeamStep({
  formData,
  updateForm,
  onComplete,
}: InviteTeamStepProps) {
  const [invited, setInvited] = useState(false);

  function handleInvite() {
    if (formData.inviteEmail.trim() !== "") {
      setInvited(true);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 py-8 justify-between">
            {/* Top branding */}
            <View className="items-start">
              <View className="w-10 h-10 rounded-xl bg-primary items-center justify-center">
                <Text className="text-white text-base font-bold">S</Text>
              </View>
            </View>

            {/* Main content */}
            <View>
              <Text className="text-3xl font-bold text-text-default mb-2">
                Invite your team
              </Text>
              <Text className="text-base text-text-subtle leading-6 mb-8">
                SelfServe is better when the whole staff is connected.
              </Text>

              {/* Email row */}
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-10 h-10 rounded-full bg-bg-input items-center justify-center flex-shrink-0">
                  <Text className="text-base text-text-subtle font-medium">+</Text>
                </View>
                <TextInput
                  className="flex-1 bg-bg-input rounded-xl px-4 py-3 text-base text-text-default"
                  placeholder="colleague@hotel.com"
                  placeholderTextColor="#bababa"
                  value={formData.inviteEmail}
                  onChangeText={(v) => {
                    updateForm({ inviteEmail: v });
                    setInvited(false);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="send"
                  onSubmitEditing={handleInvite}
                />
                <Pressable
                  onPress={handleInvite}
                  disabled={formData.inviteEmail.trim() === ""}
                  className={cn(
                    "rounded-xl px-4 py-3",
                    formData.inviteEmail.trim() !== ""
                      ? "bg-primary"
                      : "bg-stroke-subtle"
                  )}
                >
                  <Text
                    className={cn(
                      "text-sm font-semibold",
                      formData.inviteEmail.trim() !== ""
                        ? "text-white"
                        : "text-text-disabled"
                    )}
                  >
                    Invite
                  </Text>
                </Pressable>
              </View>

              {/* Success feedback */}
              {invited && (
                <View className="flex-row items-center gap-1.5 ml-14">
                  <Check size={14} color="#006c4c" />
                  <Text className="text-sm text-success font-medium">
                    Invite sent!
                  </Text>
                </View>
              )}

              <Text className="text-xs text-text-subtle mt-4 ml-14">
                You can also do this later from your settings.
              </Text>
            </View>

            {/* Action buttons */}
            <View style={{ gap: 12 }}>
              <Pressable
                onPress={onComplete}
                className="bg-primary rounded-2xl py-4 items-center"
              >
                <Text className="text-white text-base font-semibold">
                  Go to Dashboard
                </Text>
              </Pressable>
              <Pressable
                onPress={onComplete}
                className="py-4 items-center"
              >
                <Text className="text-base text-text-subtle font-medium">
                  Skip for now
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
