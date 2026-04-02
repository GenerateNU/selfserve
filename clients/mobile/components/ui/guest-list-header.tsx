import { useState, useRef } from "react";
import { View, TouchableOpacity, Modal, ScrollView, Text, Pressable } from "react-native";
import { SlidersHorizontal, X } from "lucide-react-native";
import { Colors } from "@/constants/theme";
import { SearchBar } from "@/components/ui/search-bar";
import { Filters, Filter } from "@/components/ui/filters";

interface GuestListHeaderProps {
  search: string;
  setSearch: (s: string) => void;
  filterConfig: Filter<number>[];
  activeFloors: number[];
  activeGroupSizes: number[];
  onFloorChange: (f: number) => void;
  onGroupSizeChange: (g: number) => void;
}

export function GuestListHeader({
  search, setSearch,
  filterConfig,
  activeFloors, activeGroupSizes,
  onFloorChange, onGroupSizeChange,
}: GuestListHeaderProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dropdownTop, setDropdownTop] = useState(0);
  const searchRowRef = useRef<View>(null);

  const onSearchRowLayout = () => {
    searchRowRef.current?.measureInWindow((_x, y, _w, h) => {
      setDropdownTop(y + h + 4);
    });
  };

  const hasActiveTags = activeFloors.length > 0 || activeGroupSizes.length > 0;

  return (
    <View className="px-[4vw] pt-[5vh] pb-[2vh] border-b border-stroke-subtle">
      <View
        ref={searchRowRef}
        onLayout={onSearchRowLayout}
        className="flex-row items-center gap-3"
      >
        <View className="flex-1">
          <SearchBar value={search} onChangeText={setSearch} />
        </View>
        <TouchableOpacity onPress={() => setFiltersOpen(!filtersOpen)} className="p-2">
          <SlidersHorizontal size={22} className="text-primary" />
        </TouchableOpacity>
      </View>

      {hasActiveTags && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-[1.5vh]"
          contentContainerStyle={{ gap: 8 }}
        >
          {activeFloors.map((f) => (
            <Pressable
              key={f}
              onPress={() => onFloorChange(f)}
              className="flex-row items-center gap-1 bg-card border border-primary rounded-md px-3 py-1"
            >
              <Text className="text-primary text-sm">Floor {f}</Text>
              <X size={12} color={Colors.light.tabBarActive} />
            </Pressable>
          ))}
          {activeGroupSizes.map((g) => (
            <Pressable
              key={g}
              onPress={() => onGroupSizeChange(g)}
              className="flex-row items-center gap-1 bg-card border border-primary rounded-md px-3 py-1"
            >
              <Text className="text-primary text-sm">Group Size: {g}</Text>
              <X size={12} color={Colors.light.tabBarActive} />
            </Pressable>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={filtersOpen}
        transparent
        animationType="none"
        presentationStyle="overFullScreen"
        onRequestClose={() => setFiltersOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setFiltersOpen(false)}
          className="flex-1"
        >
          <View
            className="absolute left-[4vw] right-[4vw] bg-white rounded-xl border border-stroke-subtle shadow"
            style={{ top: dropdownTop }}
          >
            <TouchableOpacity activeOpacity={1}>
              <Filters filters={filterConfig} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}