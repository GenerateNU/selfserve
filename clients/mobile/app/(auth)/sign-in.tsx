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
        router.replace("/home");
      }
    });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 justify-center px-6 bg-white">
        <Text className="text-2xl font-bold text-primary mb-2">
          Welcome back
        </Text>
        <Text className="text-sm text-shadow-strong mb-8">
          Sign in to your account
        </Text>

        <View className="gap-y-3 mb-4">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            className="border border-stroke-subtle rounded-xl px-4 py-3 text-base"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            autoCapitalize="none"
            className="border border-stroke-subtle rounded-xl px-4 py-3 text-base"
          />
        </View>

        {error && <Text className="text-danger text-sm mb-4">{error}</Text>}

        <Pressable
          onPress={onLogin}
          className="bg-primary rounded-xl py-4 items-center mb-4 active:opacity-80"
        >
          <Text className="text-white font-semibold text-base">Sign in</Text>
        </Pressable>

        <Link
          href="/sign-up"
          className="text-center text-sm text-shadow-strong"
        >
          Do not have an account?{" "}
          <Text className="text-primary font-medium">Sign up</Text>
        </Link>
      </View>
    </TouchableWithoutFeedback>
  );
}
