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
    <View>
      <Text>Verification code sent to {email}</Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="Enter code"
        keyboardType="number-pad"
        autoComplete="one-time-code"
        autoFocus
      />
      {error ? <Text>{error}</Text> : null}
      <Pressable onPress={onVerify}>
        <Text>Verify</Text>
      </Pressable>
      <Pressable onPress={onResend}>
        <Text>Resend code</Text>
      </Pressable>
    </View>
  );
}
