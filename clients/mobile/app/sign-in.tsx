import { useClerkErrorHandler } from "@/hooks/useClerkErrorHandler";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, TextInput, View, Text } from "react-native";

export default function Login() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState("");
  const run = useClerkErrorHandler(setError);

  const onLogin = () =>
    run(async () => {
      if (!isLoaded || !signIn || !setActive) return;
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/home");
      }
    });

  return (
    <View>
      <View>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          autoCapitalize="none"
        />
      </View>
      {error ? <Text>{error}</Text> : null}
      <Pressable
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        onPress={onLogin}
      >
        <Text>Sign in</Text>
      </Pressable>
      <Link href="/sign-up">
        <Text>Don't have an account? Sign up</Text>
      </Link>
    </View>
  );
}
