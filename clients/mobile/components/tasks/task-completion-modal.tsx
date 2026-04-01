import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

const primary = "#004FC5";

type TaskCompletionModalProps = {
  visible: boolean;
  taskTitle: string;
  managerNote: string;
  onChangeNote: (text: string) => void;
  onClose: () => void;
};

export function TaskCompletionModal({
  visible,
  taskTitle,
  managerNote,
  onChangeNote,
  onClose,
}: TaskCompletionModalProps) {
  const { width } = useWindowDimensions();
  const [confettiKey, setConfettiKey] = useState(0);

  useEffect(() => {
    if (visible) setConfettiKey((k) => k + 1);
  }, [visible]);

  const origin = useMemo(() => ({ x: width / 2, y: 0 }), [width]);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose}>
        <Pressable
          className="mx-5 mt-32 bg-white rounded-2xl p-5"
          onPress={(e) => e.stopPropagation()}
        >
          {visible ? (
            <ConfettiCannon
              key={confettiKey}
              count={80}
              origin={origin}
              fadeOut
              autoStart
            />
          ) : null}

          <Text className="text-2xl font-bold text-gray-900">All Done!</Text>
          <Text className="text-sm text-gray-600 mt-2">{taskTitle}</Text>

          <Text className="text-sm font-semibold text-gray-800 mt-5">
            Note for manager (optional)
          </Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-3 py-2 mt-2 text-gray-900"
            placeholder="Add a note for your manager (optional)"
            placeholderTextColor="#9CA3AF"
            value={managerNote}
            onChangeText={onChangeNote}
            multiline
          />

          <Pressable
            onPress={onClose}
            className="rounded-lg py-3 items-center mt-5"
            style={{ backgroundColor: primary }}
          >
            <Text className="text-white font-semibold">Done</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

