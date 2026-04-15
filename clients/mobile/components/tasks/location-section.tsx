import { Pressable, ScrollView, Text, View } from "react-native";

import { Section } from "./filter-section-header";

const ROOMS = ["Room 101", "Room 102", "Room 201", "Room 202", "Room 301"];

export function LocationSection() {
  return (
    <Section title="Location">
      <View className="border border-stroke-subtle rounded-xl overflow-hidden max-h-[20vh]">
        <ScrollView nestedScrollEnabled>
          {ROOMS.map((room, idx) => (
            <View
              key={room}
              className={
                idx < ROOMS.length - 1 ? "border-b border-stroke-subtle" : ""
              }
            >
              <Pressable className="px-[4vw] py-[1.2vh]">
                <Text className="text-sm text-text-default">{room}</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </View>
    </Section>
  );
}
