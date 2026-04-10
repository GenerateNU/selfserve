import { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const DURATION = 300;
const DISMISS_THRESHOLD = 100;
const DISMISS_VELOCITY = 0.5;

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const { height: screenHeight } = useWindowDimensions();
  const maxHeight = screenHeight * 0.9;

  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const dismissFromDrag = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      panY.setValue(0);
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 2,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) panY.setValue(dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > DISMISS_THRESHOLD || vy > DISMISS_VELOCITY) {
          dismissFromDrag();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40,
            friction: 8,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (visible) {
      panY.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.5,
          duration: DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      panY.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: screenHeight,
          duration: DURATION - 50,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: DURATION - 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, panY, backdropOpacity, screenHeight]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/*
        Backdrop and sheet are siblings inside this container.
        The sheet renders after the backdrop (higher z-order) so it receives
        touches first — nothing propagates up to the backdrop Pressable.
      */}
      <View style={StyleSheet.absoluteFill} className="justify-end">
        {/* Backdrop */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "black", opacity: backdropOpacity },
            ]}
          />
        </Pressable>

        {/* Sheet */}
        <Animated.View
          style={{ transform: [{ translateY: Animated.add(translateY, panY) }] }}
        >
          <View
            className="bg-white rounded-tl-3xl rounded-tr-3xl"
            style={{ maxHeight }}
          >
            {/* Drag handle */}
            <View
              className="items-center pt-4 pb-6"
              {...panResponder.panHandlers}
            >
              <View className="w-11 h-1 rounded-full bg-text-disabled" />
            </View>

            {/*
              flex-1 gives ScrollView a bounded height equal to the remaining
              space inside the maxHeight-capped sheet so it can scroll.
            */}
            <View className="flex-1 px-6 pb-12">
              {children}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
