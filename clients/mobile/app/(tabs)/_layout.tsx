import { Tabs } from "expo-router";
import React, { useCallback, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useWindowDimensions, View, Text, Pressable } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { StartupStatus, useStartup } from "@/context/startup";

const PADDING_H = 20;
const INDICATOR_W = 56;
const INDICATOR_H = 44;
const TAB_H = 60;
const TAB_COUNT = 5;

type TabBarIconProps = {
  name: React.ComponentProps<typeof IconSymbol>["name"];
  focused: boolean;
  label: string;
};

const TabBarIcon = ({ name, focused, label }: TabBarIconProps) => (
  <View className="items-center gap-0.5 px-2 py-1">
    <IconSymbol size={18} name={name} color={focused ? "#124425" : "#a2a2a2"} />
    <Text
      numberOfLines={1}
      className={`text-xs font-medium ${focused ? "text-primary-surface" : "text-[#a2a2a2]"}`}
    >
      {label}
    </Text>
  </View>
);

const PlusButton = () => (
  <View className="bg-primary rounded-full size-10 items-center justify-center">
    <IconSymbol size={22} name="plus" color="#ffffff" />
  </View>
);

type TabConfig = {
  icon: React.ComponentProps<typeof IconSymbol>["name"];
  label: string;
};

const TAB_CONFIG: Record<string, TabConfig> = {
  tasks: { icon: "checklist", label: "Tasks" },
  explore: { icon: "house.fill", label: "Rooms" },
  guests: { icon: "suitcase.cart", label: "Guests" },
  profile: { icon: "person.circle", label: "Profile" },
};

function CustomTabBar({ state, navigation, insets }: BottomTabBarProps) {
  const { width: screenWidth } = useWindowDimensions();
  const tabWidth = (screenWidth - PADDING_H * 2) / TAB_COUNT;

  const getX = useCallback(
    (index: number) => index * tabWidth + (tabWidth - INDICATOR_W) / 2,
    [tabWidth],
  );

  const initialIndex = state.index === 2 ? 0 : state.index;
  const translateX = useSharedValue(getX(initialIndex));
  const opacity = useSharedValue(state.index === 2 ? 0 : 1);

  useEffect(() => {
    if (state.index === 2) {
      opacity.value = withSpring(0, { damping: 20, stiffness: 300 });
      return;
    }
    opacity.value = withSpring(1, { damping: 20, stiffness: 300 });
    translateX.value = withSpring(getX(state.index), {
      damping: 24,
      stiffness: 350,
      mass: 0.8,
    });
  }, [state.index, getX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderTopWidth: 1,
        borderTopColor: "#e9e9e9",
        paddingBottom: Math.max(12, insets.bottom),
      }}
    >
      <View style={{ position: "relative" }}>
        <Animated.View
          style={[
            {
              position: "absolute",
              width: INDICATOR_W,
              height: INDICATOR_H,
              backgroundColor: "#edf5f1",
              borderRadius: 8,
              top: 8 + (TAB_H - INDICATOR_H) / 2,
              left: PADDING_H,
            },
            indicatorStyle,
          ]}
        />
        <View
          style={{
            flexDirection: "row",
            paddingTop: 8,
            paddingHorizontal: PADDING_H,
          }}
        >
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const isPlus = index === 2;
            const config = TAB_CONFIG[route.name];

            const handlePress = () => {
              if (process.env.EXPO_OS === "ios") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name as never);
              }
            };

            return (
              <Pressable
                key={route.key}
                style={{
                  flex: 1,
                  height: TAB_H,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={handlePress}
              >
                {isPlus ? (
                  <PlusButton />
                ) : (
                  <TabBarIcon
                    name={config.icon}
                    focused={focused}
                    label={config.label}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  const status = useStartup();
  if (status !== StartupStatus.Ready) return null;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="tasks" options={{ title: "Tasks" }} />
      <Tabs.Screen name="explore" options={{ title: "Rooms" }} />
      <Tabs.Screen name="index" options={{ title: "" }} />
      <Tabs.Screen name="guests" options={{ title: "Guest" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
