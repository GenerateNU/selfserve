import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { Colors } from "@/constants/theme";

type TaskFormBodyProps = {
  title: string;
  onTitleChange?: (value: string) => void;
  description: string;
  onDescriptionChange?: (value: string) => void;
  fields: React.ReactNode;
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  saveDisabled?: boolean;
  savePending?: boolean;
  readOnly?: boolean;
};

export function TaskFormBody({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  fields,
  onSave,
  onCancel,
  saveLabel = "Save Task",
  cancelLabel = "Cancel",
  saveDisabled = false,
  savePending = false,
  readOnly = false,
}: TaskFormBodyProps) {
  return (
    <View className="gap-6">
      <View className="border border-stroke-subtle rounded p-2">
        {readOnly ? (
          <Text className="text-2xl font-medium text-text-default tracking-tight">
            {title || "Untitled Task"}
          </Text>
        ) : (
          <TextInput
            className="text-2xl font-bold text-text-default tracking-tight"
            placeholder="Task Name"
            placeholderTextColor={Colors.light.textSubtle}
            value={title}
            onChangeText={onTitleChange}
            returnKeyType="done"
          />
        )}
      </View>

      <View className="gap-4">
        {fields}

        <View className="gap-1">
          <Text className="text-[15px] font-medium text-text-subtle tracking-tight">
            Description
          </Text>

          {readOnly ? (
            <Text className="text-[15px] text-text-secondary tracking-tight leading-[1.25]">
              {description || "Empty"}
            </Text>
          ) : (
            <TextInput
              className="text-[15px] text-text-default tracking-tight leading-[1.25]"
              placeholder="Empty"
              placeholderTextColor={Colors.light.textSubtle}
              value={description}
              onChangeText={onDescriptionChange}
              multiline
              textAlignVertical="top"
            />
          )}
        </View>
      </View>

      <View className="gap-4 mt-2">
        <Pressable
          onPress={onSave}
          disabled={saveDisabled || savePending}
          className={`bg-primary rounded h-[39px] items-center justify-center ${saveDisabled ? "opacity-50" : ""}`}
        >
          {savePending ? (
            <ActivityIndicator size="small" color={Colors.light.white} />
          ) : (
            <Text className="text-[15px] text-white tracking-tight">
              {saveLabel}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={onCancel}
          className="border border-primary rounded h-[39px] items-center justify-center"
        >
          <Text className="text-[15px] text-primary tracking-tight">
            {cancelLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}