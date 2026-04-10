import { ClerkErrorCode, ClerkStatus } from "@/constants/clerk";
import { useClerkErrorHandler } from "@/hooks/useClerkErrorHandler";
import { useAuth, useSignIn, useSSO } from "@clerk/clerk-expo";
import { AntDesign } from "@expo/vector-icons";
import { createURL } from "expo-linking";
import { router } from "expo-router";
import { coolDownAsync, maybeCompleteAuthSession, warmUpAsync } from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
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

maybeCompleteAuthSession();

const PLACEHOLDER_COLOR = "#AFAFAD";

export default function Login() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { startSSOFlow } = useSSO();
  const { isSignedIn } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const handleClerkAction = useClerkErrorHandler(setError);

  useEffect(() => {
    warmUpAsync();
    return () => {
      coolDownAsync();
    };
  }, []);

  const onLogin = () => {
    setLoading(true);
    handleClerkAction(async () => {
      if (!isLoaded || !signIn || !setActive) return;
      const result = await signIn.create({ identifier: email, password });
      if (result.status === ClerkStatus.Complete) {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      }
    }).finally(() => setLoading(false));
  };

  const onGoogleSignIn = async () => {
    if (isSignedIn) {
      router.replace("/(tabs)");
      return;
    }
    setGoogleLoading(true);
    setError("");
    try {
      const { createdSessionId, setActive: setActiveSession } =
        await startSSOFlow({
          strategy: "oauth_google",
          redirectUrl: createURL("/sign-in"),
        });
      if (createdSessionId) {
        await setActiveSession!({ session: createdSessionId });
      }
      router.replace("/(tabs)");
    } catch (err: any) {
      const code = err.errors?.[0]?.code as string | undefined;
      if (code === ClerkErrorCode.SessionExists || code === ClerkErrorCode.IdentifierAlreadySignedIn) {
        router.replace("/(tabs)");
      } else {
        setError(err.errors?.[0]?.message ?? "Google sign in failed");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

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
          Log in
        </Text>
        <Text className="text-sm text-text-subtle mb-7">
          Enter your credentials to continue
        </Text>

        <View className="gap-y-2 mb-5">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={PLACEHOLDER_COLOR}
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus
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
            onSubmitEditing={onLogin}
            className="bg-bg-input rounded-md px-3 py-3.5 text-sm text-text-default"
          />
        </View>

        {error ? (
          <Text className="text-danger text-sm mb-4">{error}</Text>
        ) : null}

        <Pressable
          onPress={onLogin}
          disabled={loading || !email || !password}
          className="bg-primary rounded-md py-3.5 items-center mb-6 active:opacity-75 disabled:opacity-40"
        >
          <Text className="text-white font-medium text-sm">
            {loading ? "Signing in…" : "Continue"}
          </Text>
        </Pressable>

        <View className="flex-row items-center mb-4">
          <View className="flex-1 h-px bg-stroke-subtle" />
          <Text className="text-text-subtle text-xs mx-3">or</Text>
          <View className="flex-1 h-px bg-stroke-subtle" />
        </View>

        <Pressable
          onPress={onGoogleSignIn}
          disabled={googleLoading}
          className="bg-bg-container border border-stroke-subtle rounded-md py-3.5 flex-row items-center justify-center gap-x-2.5 active:opacity-75 disabled:opacity-40"
        >
          <AntDesign name="google" size={16} color="#4285F4" />
          <Text className="text-text-default font-medium text-sm">
            {googleLoading ? "Signing in…" : "Continue with Google"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
