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
  TouchableWithoutFeedback,
} from "react-native";

export default function VerifyEmail() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const handleClerkAction = useClerkErrorHandler(setError);

  const onVerify = () =>
    handleClerkAction(async () => {
      if (!isLoaded) return;
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === ClerkStatus.Complete) {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      }
    });

  const onResend = () =>
    handleClerkAction(async () => {
      if (!isLoaded) return;
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 justify-center px-8 bg-white">
        <View className="items-center mb-10">
          <View className="w-10 h-10 bg-[#37352F] rounded-lg items-center justify-center">
            <Text className="text-white font-bold text-lg leading-none">S</Text>
          </View>
        </View>

        <Text className="text-[22px] font-semibold text-[#37352F] mb-1.5 tracking-tight">
          Check your email
        </Text>
        <Text className="text-sm text-[#787774] mb-7">
          We sent a code to{" "}
          <Text className="text-[#37352F] font-medium">{email}</Text>
        </Text>

        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="Verification code"
          placeholderTextColor="#AFAFAD"
          keyboardType="number-pad"
          autoComplete="one-time-code"
          autoFocus
          className="bg-[#F1F1EF] rounded-md px-3 py-3.5 text-sm text-[#37352F] mb-5 tracking-widest"
        />

        {error ? (
          <Text className="text-danger text-sm mb-4">{error}</Text>
        ) : null}

        <Pressable
          onPress={onVerify}
          className="bg-[#37352F] rounded-md py-3.5 items-center mb-3 active:opacity-75"
        >
          <Text className="text-white font-medium text-sm">Verify email</Text>
        </Pressable>

        <Pressable
          onPress={onResend}
          className="py-3 items-center active:opacity-75"
        >
          <Text className="text-sm text-[#787774]">Didn't receive it? Resend</Text>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
}
