// components/ui/filters.tsx
import React from 'react';
import { View } from 'react-native';
import { Dropdown } from './dropdown';

interface FilterOption<T> {
  label: string;
  value: T;
}

export interface Filter<T> {
  value: T;
  onChange: (value: T) => void;
  options: FilterOption<T>[];
  placeholder: string;
  emptyValue: T; 
}

interface FiltersProps {
  // must use type any here because each filter's values can have a different type
  // however, any is not a problem here because the only logic that interacts with the data
  // is performed inside the filter component which has a type T and is type safe
  filters: Filter<any>[];
  className?: string;
}

export function Filters({ filters, className }: FiltersProps) {
  return (
    <View className={`flex-row gap-[2vw] ${className || ''}`}>
      {filters.map((filter, index) => (
        <Dropdown key={index} {...filter} />
      ))}
    </View>
  );
}