import { useClerkErrorHandler } from "@/hooks/useClerkErrorHandler";
import { useSignUp } from "@clerk/clerk-expo";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, TextInput, Text, View } from "react-native";

export default function VerifyEmail() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const run = useClerkErrorHandler(setError);

  const onVerify = () =>
    run(async () => {
      if (!isLoaded) return;
      const result = await signUp.attemptEmailAddressVerification({ code });
      console.log(result.status)
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/home");
      }
    });

  const onResend = () =>
    run(async () => {
      if (!isLoaded) return;
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    });

  return (
  <View className="flex-1 justify-center px-6 bg-white">
    <Text className="text-2xl font-bold text-primary mb-2">Check your email</Text>
    <Text className="text-sm text-shadow-strong mb-8">Verification code sent to {email}</Text>

    <TextInput
      value={code}
      onChangeText={setCode}
      placeholder="Enter code"
      keyboardType="number-pad"
      autoComplete="one-time-code"
      autoFocus
      className="border border-stroke-subtle rounded-xl px-4 py-3 text-base mb-4"
    />

    {error ? (
      <Text className="text-danger text-sm mb-4">{error}</Text>
    ) : null}

    <Pressable
      onPress={onVerify}
      className="bg-primary rounded-xl py-4 items-center mb-3 active:opacity-80"
    >
      <Text className="text-white font-semibold text-base">Verify</Text>
    </Pressable>

    <Pressable
      onPress={onResend}
      className="py-3 items-center active:opacity-80"
    >
      <Text className="text-primary text-sm font-medium">Resend code</Text>
    </Pressable>
  </View>
);
}
