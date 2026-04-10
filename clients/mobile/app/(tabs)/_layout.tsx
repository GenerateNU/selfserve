import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { View, Text } from "react-native";
import { StartupStatus, useStartup } from "@/context/startup";

type TabBarIconProps = {
  name: React.ComponentProps<typeof IconSymbol>["name"];
  focused: boolean;
  activeColor: string;
  highlightColor: string;
  label: string;
};

const TabBarIcon = ({ name, focused, activeColor, label }: TabBarIconProps) => (
  <View
    className={`rounded-xl px-3 py-1 items-center gap-1 min-w-20 ${focused ? "bg-card" : "bg-transparent"}`}
  >
    <IconSymbol size={22} name={name} color={activeColor} />
    <Text numberOfLines={1} className="text-xs font-medium text-primary">
      {label}
    </Text>
  </View>
);

const PlusButton = () => (
  <View className="bg-primary rounded-full size-16 items-center justify-center mb-6">
    <IconSymbol size={22} name="plus" color={Colors["light"].background} />
  </View>
);

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? "light"];
  const status = useStartup();
  if (status !== StartupStatus.Ready) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: c.tabBarActive,
        tabBarInactiveTintColor: c.tabBarActive,
        tabBarItemStyle: {
          paddingVertical: 0,
        },
        tabBarStyle: {
          paddingTop: 8,
          paddingHorizontal: 20,
          height: 68,
        },
      }}
    >
      <Tabs.Screen
        name="create-task-ai"
        options={{ href: null, headerShown: false }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name="checklist"
              focused={focused}
              activeColor={c.tabBarActive}
              highlightColor={c.tabBarHighlight}
              label="Tasks"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Floor",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name="map"
              focused={focused}
              activeColor={c.tabBarActive}
              highlightColor={c.tabBarHighlight}
              label="Floor"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarLabel: () => null,
          tabBarIcon: () => <PlusButton />,
        }}
      />
      <Tabs.Screen
        name="guests"
        options={{
          title: "Guest",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name="suitcase.cart"
              focused={focused}
              activeColor={c.tabBarActive}
              highlightColor={c.tabBarHighlight}
              label="Guests"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name="person.circle"
              focused={focused}
              activeColor={c.tabBarActive}
              highlightColor={c.tabBarHighlight}
              label="Profile"
            />
          ),
        }}
      />
    </Tabs>
  );
}
