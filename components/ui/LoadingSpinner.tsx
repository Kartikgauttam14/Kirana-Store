import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  fullScreen?: boolean;
  color?: string;
}

export function LoadingSpinner({ size = "large", fullScreen = false, color }: LoadingSpinnerProps) {
  const colors = useColors();
  const spinner = (
    <ActivityIndicator size={size} color={color ?? colors.primary} />
  );
  if (fullScreen) {
    return <View style={styles.fullScreen}>{spinner}</View>;
  }
  return <View style={styles.inline}>{spinner}</View>;
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  inline: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
