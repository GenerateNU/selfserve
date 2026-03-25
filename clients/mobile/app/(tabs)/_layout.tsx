import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { View } from "react-native";

type TabBarIconProps = {
  name: React.ComponentProps<typeof IconSymbol>["name"];
  focused: boolean;
  activeColor: string;
  highlightColor: string;
};

const TabBarIcon = ({ name, focused, activeColor, highlightColor }: TabBarIconProps) => (
  <View style={{ backgroundColor: focused ? highlightColor : "transparent" }} className="rounded-xl p-2">
    <IconSymbol size={24} name={name} color={activeColor} />
  </View>
);

const PlusButton = ({ color }: { color: string }) => (
  <View style={{ backgroundColor: color }} className="rounded-full w-14 h-14 items-center justify-center -mb-2">
    <IconSymbol size={28} name="plus" color={Colors["light"].background} />
  </View>
);

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? "light"];

  return (
    <Tabs
      screenOptions={{
      headerShown: false,
      tabBarButton: HapticTab,
      tabBarActiveTintColor: c.tabBarActive,
      tabBarInactiveTintColor: c.tabBarActive,
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: "500",
      },
      tabBarItemStyle: {
        paddingVertical: 12,
      },
      tabBarStyle: {
        height: 80,
      },
  }}
    >
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="checklist" focused={focused} activeColor={c.tabBarActive} highlightColor={c.tabBarHighlight} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Floor",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="map" focused={focused} activeColor={c.tabBarActive} highlightColor={c.tabBarHighlight} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarLabel: () => null,
          tabBarIcon: () => <PlusButton color={c.tabBarActive} />,
        }}
      />
      <Tabs.Screen
        name="guests"
        options={{
          title: "Guest",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="suitcase.cart" focused={focused} activeColor={c.tabBarActive} highlightColor={c.tabBarHighlight} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="person.circle" focused={focused} activeColor={c.tabBarActive} highlightColor={c.tabBarHighlight} />
          ),
        }}
      />
    </Tabs>
  );
}
