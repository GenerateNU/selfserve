import { useClerkErrorHandler } from "@/hooks/useClerkErrorHandler";
import { useSignUp } from "@clerk/clerk-expo";
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

export default function SignUp() {
  const { isLoaded, signUp } = useSignUp();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const handleClerkAction = useClerkErrorHandler(setError);

  const onSignUp = () =>
    handleClerkAction(async () => {
      if (!isLoaded) return;
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      router.push(`/verify?email=${email}`);
    });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 justify-center px-6 bg-white">
        <Text className="text-2xl font-bold text-primary mb-2">
          Create account
        </Text>
        <Text className="text-sm text-shadow-strong mb-8">
          Sign up to get started
        </Text>

        <View className="gap-y-3 mb-4">
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            className="border border-stroke-subtle rounded-xl px-4 py-3 text-base"
          />
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            className="border border-stroke-subtle rounded-xl px-4 py-3 text-base"
          />
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

        {error && (
          <Text className="text-danger text-sm mb-4">{error}</Text>
        )}

        <Pressable
          onPress={onSignUp}
          className="bg-primary rounded-xl py-4 items-center mb-4 active:opacity-80"
        >
          <Text className="text-white font-semibold text-base">Sign Up</Text>
        </Pressable>

        <Link
          href="/sign-in"
          className="text-center text-sm text-shadow-strong"
        >
          Already have an account?{" "}
          <Text className="text-primary font-medium">Sign in</Text>
        </Link>
      </View>
    </TouchableWithoutFeedback>
  );
}
