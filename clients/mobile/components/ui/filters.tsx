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

export function Filters<T extends string | number>({
  filters,
  className,
}: FiltersProps<T>) {
  return (
    <View className={`gap-[2vw] ${className || ""}`}>
      {filters.map((filter, index) => (
        <MultiSelectFilter key={index} {...filter} />
      ))}
    </View>
  );
}
