import { useClerkErrorHandler } from "@/hooks/useClerkErrorHandler";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useRef, useState } from "react";
import {
  Pressable,
  TextInput,
  View,
  Text,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

const PLACEHOLDER_COLOR = "#AFAFAD";

export default function SignUp() {
  const { isLoaded, signUp } = useSignUp();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const handleClerkAction = useClerkErrorHandler(setError);

  const onSignUp = () => {
    setLoading(true);
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
    }).finally(() => setLoading(false));
  };

  const canSubmit = !!(email && password && firstName && lastName);

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
          Create an account
        </Text>
        <Text className="text-sm text-text-subtle mb-7">
          Fill in your details to get started
        </Text>

        <View className="gap-y-2 mb-5">
          <View className="flex-row gap-x-2">
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor={PLACEHOLDER_COLOR}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={() => lastNameRef.current?.focus()}
              className="flex-1 bg-bg-input rounded-md px-3 py-3.5 text-sm text-text-default"
            />
            <TextInput
              ref={lastNameRef}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor={PLACEHOLDER_COLOR}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              className="flex-1 bg-bg-input rounded-md px-3 py-3.5 text-sm text-text-default"
            />
          </View>
          <TextInput
            ref={emailRef}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={PLACEHOLDER_COLOR}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            className="bg-bg-input rounded-md px-3 py-3.5 text-sm text-text-default"
          />
          <TextInput
            ref={passwordRef}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={PLACEHOLDER_COLOR}
            secureTextEntry
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={onSignUp}
            className="bg-bg-input rounded-md px-3 py-3.5 text-sm text-text-default"
          />
        </View>

        {error ? (
          <Text className="text-danger text-sm mb-4">{error}</Text>
        ) : null}

        <Pressable
          onPress={onSignUp}
          disabled={loading || !canSubmit}
          className="bg-primary rounded-md py-3.5 items-center mb-6 active:opacity-75 disabled:opacity-40"
        >
          <Text className="text-white font-medium text-sm">
            {loading ? "Creating account…" : "Continue"}
          </Text>
        </Pressable>

        <View className="flex-row justify-center">
          <Text className="text-sm text-text-subtle">
            Already have an account?{" "}
          </Text>
          <Link href="/sign-in" className="text-sm text-primary font-medium">
            Log in
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
