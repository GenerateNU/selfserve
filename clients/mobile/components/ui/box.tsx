import React from 'react';
import { View, ViewProps } from 'react-native';

interface BoxProps extends ViewProps {
  className?: string;
}

export function Box({ className, children, ...props }: BoxProps) {
  return (
    <View className={className} {...props}>
      {children}
    </View>
  );
}