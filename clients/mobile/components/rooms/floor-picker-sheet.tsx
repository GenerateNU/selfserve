import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Check, Search, X } from "lucide-react-native";
import { Colors } from "@/constants/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type FloorPickerSheetProps = {
  visible: boolean;
  floors: number[];
  selectedFloors: number[];
  onApply: (floors: number[]) => void;
  onClose: () => void;
};

export function FloorPickerSheet({
  visible,
  floors,
  selectedFloors,
  onApply,
  onClose,
}: FloorPickerSheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [draft, setDraft] = useState<number[]>(selectedFloors);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (visible) {
      setDraft(selectedFloors);
      setSearch("");
      translateY.setValue(SCREEN_HEIGHT);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 28,
        stiffness: 280,
      }).start();
    }
  }, [visible, selectedFloors, translateY]);

  function close() {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(onClose);
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 3,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) translateY.setValue(dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > 80 || vy > 0.5) {
          close();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 28,
            stiffness: 280,
          }).start();
        }
      },
    }),
  ).current;

  const filtered = floors.filter((f) =>
    `floor ${f}`.includes(search.toLowerCase()),
  );

  function toggle(floor: number) {
    setDraft((d) =>
      d.includes(floor) ? d.filter((f) => f !== floor) : [...d, floor],
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={close}
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable className="absolute inset-0 bg-black/40" onPress={close} />

        <Animated.View
          style={{
            backgroundColor: "white",
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            maxHeight: SCREEN_HEIGHT * 0.9,
            transform: [{ translateY }],
          }}
          onStartShouldSetResponder={() => true}
        >
          {/* Drag handle */}
          <View
            {...panResponder.panHandlers}
            className="items-center pt-3 pb-2"
          >
            <View className="w-11 h-1 rounded-full bg-stroke-subtle" />
          </View>

          {/* Search bar */}
          <View className="px-6 pt-3 pb-2">
            <View className="flex-row items-center bg-bg-input rounded-lg px-3 py-4 gap-2">
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search for a floor"
                placeholderTextColor={Colors.light.textSubtle}
                className="flex-1 text-[15px] text-text-default"
              />
              <Search size={14} color={Colors.light.textSubtle} />
            </View>
          </View>

          {/* Floor list */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flexGrow: 0, maxHeight: SCREEN_HEIGHT * 0.4 }}
          >
            {filtered.map((floor) => {
              const selected = draft.includes(floor);
              return (
                <Pressable
                  key={floor}
                  onPress={() => toggle(floor)}
                  className="flex-row items-center gap-3 px-6 py-4"
                >
                  <View
                    className="w-4 h-4 items-center justify-center rounded"
                    style={
                      selected
                        ? { backgroundColor: "#124425" }
                        : {
                            borderWidth: 1,
                            borderColor: "rgba(46,46,46,0.5)",
                            borderRadius: 2,
                          }
                    }
                  >
                    {selected && (
                      <Check size={9} color="white" strokeWidth={3} />
                    )}
                  </View>
                  <Text className="text-[14px] text-text-default leading-5">
                    Floor {floor}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View>
            {/* Selected floors label */}
            <View className="border-b border-stroke-subtle px-6 py-3">
              <Text className="text-[12px] text-text-subtle">
                Selected Floors
              </Text>
            </View>

            {/* Selected tags row */}
            <View className="flex-row items-center px-6 py-3 min-h-[56px]">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{
                  gap: 4,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {draft
                  .slice()
                  .sort((a, b) => a - b)
                  .map((floor) => (
                    <Pressable
                      key={floor}
                      onPress={() => toggle(floor)}
                      className="flex-row items-center gap-2 bg-bg-selected px-2 py-1 rounded"
                    >
                      <Text className="text-[14px] text-primary">
                        Floor {floor}
                      </Text>
                      <X size={8} color={Colors.light.tabBarActive} />
                    </Pressable>
                  ))}
              </ScrollView>
              {draft.length > 0 && (
                <Pressable onPress={() => setDraft([])} className="ml-2">
                  <Text className="text-[15px] text-text-subtle tracking-tight">
                    Clear
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Action buttons */}
            <View className="flex-row gap-3 border-t border-stroke-subtle px-6 pt-3 pb-12">
              <Pressable
                onPress={close}
                className="flex-1 items-center justify-center py-[10px] rounded"
              >
                <Text className="text-[14px] leading-5 text-primary">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  onApply(draft);
                  close();
                }}
                className="flex-1 items-center justify-center bg-primary py-[10px] rounded"
              >
                <Text className="text-[14px] leading-5 text-white">
                  Apply Filters
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
