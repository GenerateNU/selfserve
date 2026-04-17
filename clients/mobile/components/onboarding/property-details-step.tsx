import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ChevronDown, Check } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { PROPERTY_TYPES } from "./onboarding-mocks";
import type { OnboardingFormData } from "./types";

type PropertyDetailsStepProps = {
  formData: OnboardingFormData;
  updateForm: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  stepCurrent: number;
  stepTotal: number;
};

export function PropertyDetailsStep({
  formData,
  updateForm,
  onNext,
  onBack,
  stepCurrent,
  stepTotal,
}: PropertyDetailsStepProps) {
  const [pickerVisible, setPickerVisible] = useState(false);

  const isValid =
    formData.hotelName.trim() !== "" &&
    formData.numberOfRooms.trim() !== "" &&
    formData.propertyType !== "";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View className="px-6 pt-4">
          <Pressable onPress={onBack} hitSlop={12} className="self-start mb-4">
            <ChevronLeft size={24} color="#15502c" />
          </Pressable>

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

          <Text className="text-2xl font-bold text-text-default">
            Tell us about your property
          </Text>
          <Text className="mt-1 text-sm text-text-subtle leading-5">
            We'll use this to set up your workspace.
          </Text>
        </View>

        {/* Form */}
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hotel Name */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-text-default mb-2">
              Hotel Name
            </Text>
            <TextInput
              className="bg-bg-input rounded-xl px-4 py-3.5 text-base text-text-default"
              placeholder="e.g. Grand Ocean Hotel"
              placeholderTextColor="#bababa"
              value={formData.hotelName}
              onChangeText={(v) => updateForm({ hotelName: v })}
              returnKeyType="next"
            />
          </View>

          {/* Number of Rooms */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-text-default mb-2">
              Number of Rooms
            </Text>
            <TextInput
              className="bg-bg-input rounded-xl px-4 py-3.5 text-base text-text-default"
              placeholder="e.g. 120"
              placeholderTextColor="#bababa"
              value={formData.numberOfRooms}
              onChangeText={(v) => updateForm({ numberOfRooms: v.replace(/[^0-9]/g, "") })}
              keyboardType="number-pad"
              returnKeyType="done"
            />
          </View>

          {/* Property Type */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-text-default mb-2">
              Property Type
            </Text>
            <Pressable
              onPress={() => setPickerVisible(true)}
              className="bg-bg-input rounded-xl px-4 py-3.5 flex-row items-center justify-between"
            >
              <Text
                className={cn(
                  "text-base",
                  formData.propertyType ? "text-text-default" : "text-text-disabled"
                )}
              >
                {formData.propertyType || "Select property type"}
              </Text>
              <ChevronDown size={18} color="#747474" />
            </Pressable>
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="px-6 pb-4">
          <Pressable
            onPress={onNext}
            disabled={!isValid}
            className={cn(
              "rounded-2xl py-4 items-center",
              isValid ? "bg-primary" : "bg-stroke-subtle"
            )}
          >
            <Text
              className={cn(
                "text-base font-semibold",
                isValid ? "text-white" : "text-text-disabled"
              )}
            >
              Continue
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Property Type Picker Modal */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <Pressable
            className="flex-1"
            onPress={() => setPickerVisible(false)}
          />
          <View className="bg-white rounded-t-3xl px-6 pt-5 pb-10">
            <View className="w-10 h-1 rounded-full bg-stroke-subtle self-center mb-5" />
            <Text className="text-base font-semibold text-text-default mb-3">
              Property Type
            </Text>
            {PROPERTY_TYPES.map((type) => (
              <Pressable
                key={type}
                onPress={() => {
                  updateForm({ propertyType: type });
                  setPickerVisible(false);
                }}
                className="flex-row items-center justify-between py-4 border-b border-stroke-subtle"
              >
                <Text className="text-base text-text-default">{type}</Text>
                {formData.propertyType === type && (
                  <Check size={20} color="#15502c" />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
