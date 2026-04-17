import {
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { SearchBar } from "./search-bar";
import { SlidersHorizontal, X } from "lucide-react-native";
import { GuestFilterState } from "./guest-filter-sheet";
import { Colors } from "@/constants/theme";

interface GuestListHeaderProps {
  search: string;
  setSearch: (s: string) => void;
  filters: GuestFilterState;
  onFiltersChange: (f: GuestFilterState) => void;
  onOpenFilterSheet: () => void;
}

export function GuestListHeader({
  search,
  setSearch,
  filters,
  onFiltersChange,
  onOpenFilterSheet,
}: GuestListHeaderProps) {
  const removeChip = (patch: Partial<GuestFilterState>) =>
    onFiltersChange({ ...filters, ...patch });

  const hasActiveFilters =
    filters.floors.length > 0 ||
    filters.status.length > 0 ||
    filters.assistance.length > 0 ||
    filters.requestSort !== null ||
    filters.floorSort !== null;

  return (
    <View className="px-6 py-3 border-b border-stroke-subtle">
      <View className="flex-row items-center gap-3">
        <View className="flex-1">
          <SearchBar value={search} onChangeText={setSearch} />
        </View>
        <TouchableOpacity onPress={onOpenFilterSheet} className="p-2">
          <SlidersHorizontal size={22} className="text-primary" />
        </TouchableOpacity>
      </View>

      {hasActiveFilters && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-[1.5vh]"
          contentContainerStyle={{ gap: 8 }}
        >
          {filters.floors.map((f) => (
            <Chip
              key={`floor-${f}`}
              label={`Floor ${f}`}
              onRemove={() =>
                removeChip({ floors: filters.floors.filter((x) => x !== f) })
              }
            />
          ))}
          {filters.status.map((s) => (
            <Chip
              key={`status-${s}`}
              label={s === "active" ? "Active" : "Inactive"}
              onRemove={() =>
                removeChip({
                  status: filters.status.filter((x) => x !== s),
                })
              }
            />
          ))}
          {filters.assistance.map((a) => (
            <Chip
              key={`assist-${a}`}
              label={a.charAt(0).toUpperCase() + a.slice(1)}
              onRemove={() =>
                removeChip({
                  assistance: filters.assistance.filter((x) => x !== a),
                })
              }
            />
          ))}
          {filters.requestSort && (
            <Chip
              label={
                filters.requestSort === "high_to_low"
                  ? "Requests: High to Low"
                  : filters.requestSort === "low_to_high"
                    ? "Requests: Low to High"
                    : "Requests: Urgent"
              }
              onRemove={() => removeChip({ requestSort: null })}
            />
          )}
          {filters.floorSort && (
            <Chip
              label={
                filters.floorSort === "ascending"
                  ? "Floors: Ascending"
                  : "Floors: Descending"
              }
              onRemove={() => removeChip({ floorSort: null })}
            />
          )}
        </ScrollView>
      )}
    </View>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Pressable
      onPress={onRemove}
      className="flex-row items-center gap-1 bg-card border border-primary rounded-md px-3 py-1"
    >
      <Text className="text-primary text-sm">{label}</Text>
      <X size={12} color={Colors.light.tabBarActive} />
    </Pressable>
  );
}
