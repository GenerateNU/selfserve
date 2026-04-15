import { ActivityIndicator, ScrollView, View } from "react-native";

import { useGetRoomsFloors } from "@shared";

import { CheckboxRow, Section } from "./filter-section-header";

type LocationSectionProps = {
  floors: number[];
  onFloorsChange: (floors: number[]) => void;
};

export function LocationSection({
  floors,
  onFloorsChange,
}: LocationSectionProps) {
  const { data: allFloors = [], isLoading } = useGetRoomsFloors({
    query: { staleTime: Infinity },
  });

  function toggle(floor: number) {
    const next = floors.includes(floor)
      ? floors.filter((f) => f !== floor)
      : [...floors, floor];
    onFloorsChange(next);
  }

  return (
    <Section title="Location">
      {isLoading ? (
        <ActivityIndicator size="small" />
      ) : (
        <View className="border border-stroke-subtle rounded-xl overflow-hidden max-h-[20vh]">
          <ScrollView nestedScrollEnabled>
            {allFloors.map((floor, idx) => (
              <View
                key={floor}
                className={`px-[4vw] ${idx < allFloors.length - 1 ? "border-b border-stroke-subtle" : ""}`}
              >
                <CheckboxRow
                  label={`Floor ${floor}`}
                  selected={floors.includes(floor)}
                  onPress={() => toggle(floor)}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </Section>
  );
}
