import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Badge } from "@/components/ui/Badge";
import { useColors } from "@/hooks/useColors";
import { Forecast } from "@/types/forecast.types";

interface ForecastCardProps {
  forecast: Forecast;
}

export function ForecastCard({ forecast }: ForecastCardProps) {
  const colors = useColors();
  const [tab, setTab] = useState<"7d" | "14d" | "30d">("7d");

  const confidenceVariant =
    forecast.confidence === "High"
      ? "success"
      : forecast.confidence === "Medium"
      ? "warning"
      : "danger";

  const forecastValue =
    tab === "7d"
      ? forecast.forecast7d
      : tab === "14d"
      ? forecast.forecast14d
      : forecast.forecast30d;

  const stockPercent = Math.min(
    100,
    (forecast.currentStock / Math.max(forecast.reorderLevel * 2, 1)) * 100
  );

  const handleWhatsApp = () => {
    if (!forecast.supplierPhone || !forecast.supplierName) {
      Alert.alert(
        "No Supplier",
        "Add supplier details to this product first."
      );
      return;
    }
    const msg = encodeURIComponent(
      `Hello ${forecast.supplierName}, I need to order ${forecast.recommendedQty} ${forecast.unit} of ${forecast.productName}. Please confirm delivery.`
    );
    Linking.openURL(`https://wa.me/91${forecast.supplierPhone}?text=${msg}`);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{forecast.productName}</Text>
          <Badge label={forecast.productCategory} variant="muted" size="sm" />
        </View>
        {forecast.restockNow && (
          <View style={[styles.urgentBadge, { backgroundColor: colors.dangerLight }]}>
            <Feather name="alert-triangle" size={12} color={colors.danger} />
            <Text style={[styles.urgentText, { color: colors.danger }]}>Restock Now</Text>
          </View>
        )}
      </View>

      <View style={styles.stockSection}>
        <View style={styles.stockRow}>
          <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>
            Current: {forecast.currentStock} {forecast.unit}
          </Text>
          <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>
            Reorder at: {forecast.reorderLevel}
          </Text>
        </View>
        <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${stockPercent}%` as any,
                backgroundColor:
                  stockPercent <= 25
                    ? colors.danger
                    : stockPercent <= 50
                    ? colors.warning
                    : colors.success,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.tabBar}>
        {(["7d", "14d", "30d"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.tab,
              tab === t && { backgroundColor: colors.primary },
            ]}
            onPress={() => setTab(t)}
          >
            <Text
              style={[
                styles.tabText,
                { color: tab === t ? colors.primaryForeground : colors.mutedForeground },
              ]}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.forecastBox, { backgroundColor: colors.primaryLight }]}>
        <Text style={[styles.forecastValue, { color: colors.primary }]}>
          {forecastValue.toFixed(1)} {forecast.unit}
        </Text>
        <Text style={[styles.forecastLabel, { color: colors.textSecondary }]}>
          predicted demand
        </Text>
        <Badge label={forecast.confidence} variant={confidenceVariant} size="sm" />
      </View>

      {forecast.seasonalNote && (
        <Text style={[styles.seasonalNote, { color: colors.secondary }]}>
          {forecast.seasonalNote}
        </Text>
      )}

      <Text style={[styles.reasoning, { color: colors.textSecondary }]}>
        {forecast.reasoning}
      </Text>

      <View style={styles.footer}>
        <Text style={[styles.reorderDay, { color: colors.textSecondary }]}>
          Best reorder: <Text style={{ fontWeight: "600", color: colors.textPrimary }}>{forecast.bestReorderDay}</Text>
        </Text>
        <TouchableOpacity
          style={[styles.waBtn, { backgroundColor: "#25D366" }]}
          onPress={handleWhatsApp}
        >
          <Feather name="message-circle" size={14} color="#fff" />
          <Text style={styles.waBtnText}>Order via WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flex: 1, gap: 4 },
  name: { fontSize: 16, fontWeight: "700" },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  urgentText: { fontSize: 11, fontWeight: "700" },
  stockSection: { gap: 6 },
  stockRow: { flexDirection: "row", justifyContent: "space-between" },
  stockLabel: { fontSize: 12 },
  progressBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    padding: 3,
    gap: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
  },
  tabText: { fontSize: 13, fontWeight: "600" },
  forecastBox: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 4,
  },
  forecastValue: { fontSize: 28, fontWeight: "800" },
  forecastLabel: { fontSize: 13 },
  seasonalNote: { fontSize: 13, fontStyle: "italic", lineHeight: 18 },
  reasoning: { fontSize: 13, lineHeight: 18 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reorderDay: { fontSize: 13 },
  waBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  waBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});
