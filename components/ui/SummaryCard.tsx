import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface SummaryCardProps {
  label: string;
  value: string;
  icon: keyof typeof Feather.glyphMap;
  iconColor?: string;
  iconBg?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
}

export function SummaryCard({ label, value, icon, iconColor, iconBg, trend, trendLabel }: SummaryCardProps) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg ?? colors.primaryLight }]}>
        <Feather name={icon} size={20} color={iconColor ?? colors.primary} />
      </View>
      <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      {trend && trendLabel && (
        <Text
          style={[
            styles.trend,
            { color: trend === "up" ? colors.success : trend === "down" ? colors.danger : colors.mutedForeground },
          ]}
        >
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"} {trendLabel}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
  },
  trend: {
    fontSize: 11,
    fontWeight: "500",
  },
});
