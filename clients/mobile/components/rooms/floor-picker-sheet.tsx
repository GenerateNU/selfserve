import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  Text,
  View,
} from "react-native";
import { Check } from "lucide-react-native";
import { Colors } from "@/constants/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export type Floor = {
  id: string;
  label: string;
};

type FloorPickerSheetProps = {
  visible: boolean;
  floors: Floor[];
  selectedFloorId: string;
  onSelect: (floor: Floor) => void;
  onClose: () => void;
};

export function FloorPickerSheet({
  visible,
  floors,
  selectedFloorId,
  onSelect,
  onClose,
}: FloorPickerSheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(SCREEN_HEIGHT);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 28,
        stiffness: 280,
      }).start();
    }
  }, [visible, translateY]);

  const close = () => {
    Animated.spring(translateY, {
      toValue: SCREEN_HEIGHT,
      useNativeDriver: true,
      damping: 28,
      stiffness: 280,
    }).start(() => onClose());
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 10,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) translateY.setValue(dy);
      },
      onPanResponderRelease: (_, { dy }) => {
        if (dy > 100) close();
        else
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 28,
            stiffness: 280,
          }).start();
      },
    }),
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={close}
    >
      <Pressable className="flex-1 bg-black/40" onPress={close} />
      <Animated.View
        style={{ transform: [{ translateY }] }}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl"
      >
        <View {...panResponder.panHandlers} className="items-center pt-3 pb-2">
          <View className="w-10 h-1 rounded-full bg-stroke-subtle" />
        </View>
        <Text className="text-base font-medium text-text-default px-5 pb-3">
          Select Floor
        </Text>
        {floors.map((floor, i) => (
          <Pressable
            key={floor.id}
            onPress={() => {
              onSelect(floor);
              close();
            }}
            className={`flex-row items-center justify-between px-5 py-4 ${
              i < floors.length - 1 ? "border-b border-stroke-subtle" : ""
            }`}
          >
            <Text className="text-[15px] text-text-default">{floor.label}</Text>
            {selectedFloorId === floor.id && (
              <Check size={18} color={Colors.light.primary} />
            )}
          </Pressable>
        ))}
        <View className="h-8" />
      </Animated.View>
    </Modal>
  );
}
