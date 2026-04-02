import React from "react";
import { View } from "react-native";
import { MultiSelectFilter } from "./mutli-select-filter";

export interface FilterOption<T extends string | number> {
  label: string;
  value: T;
}

export interface Filter<T extends string | number> {
  value: T[];
  onChange: (value: T) => void;
  options: FilterOption<T>[];
  placeholder: string;
}

interface FiltersProps<T extends string | number> {
  filters: Filter<T>[];
  className?: string;
}

export function Filters<T extends string | number>({ filters, className }: FiltersProps<T>) {
  return (
    <View className={`flex-row gap-[2vw] p-[3vw] ${className || ""}`}>
      {filters.map((filter, index) => (
        <View key={index} className="flex-1">
          <MultiSelectFilter {...filter} />
        </View>
      ))}
    </View>
  );
}