import { Modal, Pressable, Text, View } from "react-native";

type TaskCompletionModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function TaskCompletionModal({
  visible,
  onClose,
}: TaskCompletionModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/40 justify-center items-center px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          <Text className="text-xl font-bold text-center">Task completed</Text>
          <Text className="text-sm text-gray-600 text-center mt-2">
            Nice work. Manager notes are not synced yet.
          </Text>
          <Pressable
            onPress={onClose}
            className="bg-blue-600 rounded-xl py-3 mt-6 items-center"
          >
            <Text className="text-white font-semibold">Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
