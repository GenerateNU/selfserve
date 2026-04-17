import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";

type StepLayoutProps = {
  title: string;
  subtitle?: string;
  stepCurrent?: number;
  stepTotal?: number;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function StepLayout({
  title,
  subtitle,
  stepCurrent,
  stepTotal,
  onBack,
  children,
  footer,
}: StepLayoutProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-4">
        {onBack && (
          <Pressable
            onPress={onBack}
            hitSlop={12}
            className="self-start mb-4"
          >
            <ChevronLeft size={24} color="#15502c" />
          </Pressable>
        )}

        {stepCurrent !== undefined && stepTotal !== undefined && (
          <View className="mb-5">
            <View className="flex-row mb-2" style={{ gap: 6 }}>
              {Array.from({ length: stepTotal }, (_, i) => (
                <View
                  key={i}
                  className={`h-1 rounded-full ${i < stepCurrent ? "bg-primary" : "bg-stroke-subtle"}`}
                  style={{ flex: 1 }}
                />
              ))}
            </View>
            <Text className="text-xs text-text-subtle font-medium">
              Step {stepCurrent} of {stepTotal}
            </Text>
          </View>
        )}

        <Text className="text-2xl font-bold text-text-default">{title}</Text>
        {subtitle ? (
          <Text className="mt-1 text-sm text-text-subtle leading-5">
            {subtitle}
          </Text>
        ) : null}
      </View>

      {children}

      {footer ? <View className="px-6 pb-4">{footer}</View> : null}
    </SafeAreaView>
  );
}
