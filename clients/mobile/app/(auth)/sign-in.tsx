import { ClerkStatus } from "@/constants/clerk";
import { useClerkErrorHandler } from "@/hooks/useClerkErrorHandler";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  TextInput,
  View,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";

export default function Login() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState("");
  const handleClerkAction = useClerkErrorHandler(setError);

  const onLogin = () =>
    handleClerkAction(async () => {
      if (!isLoaded || !signIn || !setActive) return;
      const result = await signIn.create({ identifier: email, password });
      if (result.status === ClerkStatus.Complete) {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      }
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
          Log in
        </Text>
        <Text className="text-sm text-[#787774] mb-7">
          Enter your credentials to continue
        </Text>

        <View className="gap-y-2 mb-5">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#AFAFAD"
            keyboardType="email-address"
            autoCapitalize="none"
            className="bg-[#F1F1EF] rounded-md px-3 py-3.5 text-sm text-[#37352F]"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#AFAFAD"
            secureTextEntry
            autoCapitalize="none"
            className="bg-[#F1F1EF] rounded-md px-3 py-3.5 text-sm text-[#37352F]"
          />
        </View>

        {error ? (
          <Text className="text-danger text-sm mb-4">{error}</Text>
        ) : null}

        <Pressable
          onPress={onLogin}
          className="bg-[#37352F] rounded-md py-3.5 items-center mb-6 active:opacity-75"
        >
          <Text className="text-white font-medium text-sm">Continue</Text>
        </Pressable>

        <View className="flex-row justify-center">
          <Text className="text-sm text-[#787774]">No account? </Text>
          <Link href="/sign-up" className="text-sm text-[#37352F] font-medium">
            Sign up
          </Link>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
