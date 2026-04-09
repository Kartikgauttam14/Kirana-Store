import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type BadgeVariant = "primary" | "success" | "warning" | "danger" | "muted" | "secondary";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

export function Badge({ label, variant = "primary", size = "md" }: BadgeProps) {
  const colors = useColors();

  const bgMap: Record<BadgeVariant, string> = {
    primary: colors.primaryLight,
    success: colors.successLight,
    warning: colors.warningLight,
    danger: colors.dangerLight,
    muted: colors.muted,
    secondary: "#E8F0FE",
  };

  const colorMap: Record<BadgeVariant, string> = {
    primary: colors.primary,
    success: colors.success,
    warning: "#E65100",
    danger: colors.danger,
    muted: colors.mutedForeground,
    secondary: colors.secondary,
  };

  return (
    <View
      style={[
        styles.badge,
        size === "sm" ? styles.badgeSm : styles.badgeMd,
        { backgroundColor: bgMap[variant] },
      ]}
    >
      <Text
        style={[
          styles.label,
          size === "sm" ? styles.labelSm : styles.labelMd,
          { color: colorMap[variant] },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    alignSelf: "flex-start",
  },
  badgeSm: { paddingHorizontal: 8, paddingVertical: 2 },
  badgeMd: { paddingHorizontal: 10, paddingVertical: 4 },
  label: { fontWeight: "600" },
  labelSm: { fontSize: 11 },
  labelMd: { fontSize: 12 },
});
