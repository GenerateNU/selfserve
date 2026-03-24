import { useClerkErrorHandler } from "@/hooks/useClerkErrorHandler";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, TextInput, View, Text } from "react-native";

export default function SignUp() {
  const { isLoaded, signUp } = useSignUp();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState("");
  const run = useClerkErrorHandler(setError);

  const onSignUp = () =>
    run(async () => {
      if (!isLoaded) return;
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      router.push(`/verify?email=${email}`);
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
        onPress={onSignUp}
      >
        <Text>Sign Up</Text>
      </Pressable>
      <Link href="/sign-in">
        <Text>Already have an account? Sign in</Text>
      </Link>
    </View>
  );
}
