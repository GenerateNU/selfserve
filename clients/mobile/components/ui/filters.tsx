import React from "react";
import { View } from "react-native";
import { MultiSelectFilter } from "./mutli-select-filter";

interface FilterOption {
  label: string;
  value: number;
}

export interface Filter {
  value: number[] | null;
  onChange: (value: number) => void;
  options: FilterOption[];
  placeholder: string;
}

interface FiltersProps {
  filters: Filter[];
  className?: string;
}

export function Filters({ filters, className }: FiltersProps) {
  return (
    <View className={`gap-[2vw] ${className || ""}`}>
      {filters.map((filter, index) => (
        <MultiSelectFilter key={index} {...filter} />
      ))}
    </View>
  );
}
