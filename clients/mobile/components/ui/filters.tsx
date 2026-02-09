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