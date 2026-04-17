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
  label: string;
};

const TabBarIcon = ({ name, focused, label }: TabBarIconProps) => (
  <View className="w-[60px] h-[60px] items-center justify-center">
    <View
      className={`rounded-lg px-2 py-1 items-center gap-0.5 ${focused ? "bg-bg-selected" : "bg-transparent"}`}
    >
      <IconSymbol size={18} name={name} color={focused ? "#124425" : "#a2a2a2"} />
      <Text
        numberOfLines={1}
        className={`text-xs font-medium ${focused ? "text-primary-surface" : "text-[#a2a2a2]"}`}
      >
        {label}
      </Text>
    </View>
  </View>
);

const PlusButton = () => (
  <View className="bg-primary rounded-full size-10 items-center justify-center">
    <IconSymbol size={22} name="plus" color="#ffffff" />
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
        tabBarInactiveTintColor: "#a2a2a2",
        tabBarItemStyle: {
          paddingVertical: 0,
        },
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: 12,
          paddingHorizontal: 20,
          height: 80,
          borderTopWidth: 1,
          borderTopColor: "#e9e9e9",
          backgroundColor: "#ffffff",
        },
      }}
    >
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="checklist" focused={focused} label="Tasks" />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Rooms",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="house.fill" focused={focused} label="Rooms" />
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
            <TabBarIcon name="suitcase.cart" focused={focused} label="Guests" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="person.circle" focused={focused} label="Profile" />
          ),
        }}
      />
    </Tabs>
  );
}
