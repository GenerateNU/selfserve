import { ClerkStatus } from "@/constants/clerk";
import { useClerkErrorHandler } from "@/hooks/useClerkErrorHandler";
import { useSignUp } from "@clerk/clerk-expo";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  TextInput,
  Text,
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

const PLACEHOLDER_COLOR = "#AFAFAD";

export default function VerifyEmail() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleClerkAction = useClerkErrorHandler(setError);

  const onVerify = () => {
    setLoading(true);
    handleClerkAction(async () => {
      if (!isLoaded) return;
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === ClerkStatus.Complete) {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      }
    }).finally(() => setLoading(false));
  };

  const onResend = () =>
    handleClerkAction(async () => {
      if (!isLoaded) return;
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg-surface"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-8 py-12"
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        <View className="items-center mb-10">
          <View className="w-10 h-10 bg-primary rounded-lg items-center justify-center">
            <Text className="text-white font-bold text-lg leading-none">S</Text>
          </View>
        </View>

        <Text className="text-[22px] font-semibold text-text-default mb-1.5 tracking-tight">
          Check your email
        </Text>
        <Text className="text-sm text-text-subtle mb-7">
          We sent a code to{" "}
          <Text className="text-text-default font-medium">{email}</Text>
        </Text>

        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="Verification code"
          placeholderTextColor={PLACEHOLDER_COLOR}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={onVerify}
          className="bg-bg-input rounded-md px-3 py-3.5 text-sm text-text-default mb-5 tracking-widest"
        />

        {error ? (
          <Text className="text-danger text-sm mb-4">{error}</Text>
        ) : null}

        <Pressable
          onPress={onVerify}
          disabled={loading || !code}
          className="bg-primary rounded-md py-3.5 items-center mb-3 active:opacity-75 disabled:opacity-40"
        >
          <Text className="text-white font-medium text-sm">
            {loading ? "Verifying…" : "Verify email"}
          </Text>
        </Pressable>

        <Pressable
          onPress={onResend}
          className="py-3 items-center active:opacity-75"
        >
          <Text className="text-sm text-text-subtle">Didn't receive it? Resend</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
