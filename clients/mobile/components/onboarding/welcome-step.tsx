import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type WelcomeStepProps = {
  onNext: () => void;
};

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8 justify-between">
        <View className="items-start">
          <View className="w-14 h-14 rounded-2xl bg-primary items-center justify-center mb-3">
            <Text className="text-white text-xl font-bold">S</Text>
          </View>
          <Text className="text-lg font-semibold text-primary">SelfServe</Text>
        </View>

        <View>
          <Text className="text-4xl font-bold text-text-default mb-4 leading-tight">
            Welcome to{"\n"}SelfServe
          </Text>
          <Text className="text-base text-text-subtle leading-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec risus
            massa, venenatis in sapien sit amet, aliquam facilisis nunc.
          </Text>
        </View>

        <Pressable
          onPress={onNext}
          className="bg-primary rounded-2xl py-4 items-center"
        >
          <Text className="text-white text-base font-semibold">Get Started</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
