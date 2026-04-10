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
      <View className="flex-1 justify-center px-8 bg-white">
        <View className="items-center mb-10">
          <View className="w-10 h-10 bg-[#37352F] rounded-lg items-center justify-center">
            <Text className="text-white font-bold text-lg leading-none">S</Text>
          </View>
        </View>

        <Text className="text-[22px] font-semibold text-[#37352F] mb-1.5 tracking-tight">
          Create an account
        </Text>
        <Text className="text-sm text-[#787774] mb-7">
          Fill in your details to get started
        </Text>

        <View className="gap-y-2 mb-5">
          <View className="flex-row gap-x-2">
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor="#AFAFAD"
              className="flex-1 bg-[#F1F1EF] rounded-md px-3 py-3.5 text-sm text-[#37352F]"
            />
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor="#AFAFAD"
              className="flex-1 bg-[#F1F1EF] rounded-md px-3 py-3.5 text-sm text-[#37352F]"
            />
          </View>
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
          onPress={onSignUp}
          className="bg-[#37352F] rounded-md py-3.5 items-center mb-6 active:opacity-75"
        >
          <Text className="text-white font-medium text-sm">Continue</Text>
        </Pressable>

        <View className="flex-row justify-center">
          <Text className="text-sm text-[#787774]">Already have an account? </Text>
          <Link href="/sign-in" className="text-sm text-[#37352F] font-medium">
            Log in
          </Link>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
