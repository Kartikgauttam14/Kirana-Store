import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Badge } from "@/components/ui/Badge";
import { useColors } from "@/hooks/useColors";
import { Forecast } from "@/types/forecast.types";
import { GlassCard } from "@/components/ui/GlassCard";

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
    <GlassCard intensity={15} style={styles.card} borderRadius={28}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{forecast.productName}</Text>
          <View style={styles.badgeRow}>
             <Badge label={forecast.productCategory} variant="muted" size="sm" />
             <View style={[styles.aiBadge, { backgroundColor: colors.primary + '15' }]}>
                <MaterialCommunityIcons name="brain" size={10} color={colors.primary} />
                <Text style={[styles.aiBadgeText, { color: colors.primary }]}>AI PREDICTED</Text>
             </View>
          </View>
        </View>
        {forecast.restockNow && (
          <LinearGradient
            colors={[colors.danger, colors.accent]}
            style={styles.urgentBadge}
          >
            <Feather name="zap" size={10} color="#fff" />
            <Text style={styles.urgentText}>RESTOCK</Text>
          </LinearGradient>
        )}
      </View>

      <View style={styles.stockSection}>
        <View style={styles.stockRow}>
          <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>
            Stock: <Text style={{fontWeight: '800', color: colors.textPrimary}}>{forecast.currentStock} {forecast.unit}</Text>
          </Text>
          <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>
            Goal: {forecast.reorderLevel * 2}
          </Text>
        </View>
        <View style={[styles.progressBg, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
          <LinearGradient
            colors={
              stockPercent <= 25
                ? [colors.danger, colors.danger + 'CC']
                : stockPercent <= 50
                ? [colors.warning, colors.warning + 'CC']
                : [colors.primary, colors.success]
            }
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={[styles.progressFill, { width: `${stockPercent}%` as any }]}
          />
        </View>
      </View>

      <View style={styles.predictionSection}>
         <View style={styles.tabBar}>
            {(["7d", "14d", "30d"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.tab,
                  tab === t && { backgroundColor: colors.primary, elevation: 4 },
                ]}
                onPress={() => setTab(t)}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: tab === t ? colors.primary : colors.textPlaceholder },
                  ]}
                >
                  {t.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.forecastBox, { backgroundColor: colors.primary + '08' }]}>
            <View style={styles.valRow}>
               <Text style={[styles.forecastValue, { color: colors.primary }]}>
                 {forecastValue.toFixed(1)}
               </Text>
               <Text style={[styles.unitText, { color: colors.textPlaceholder }]}>{forecast.unit}</Text>
            </View>
            <Text style={[styles.forecastLabel, { color: colors.textSecondary }]}>
              Estimated Demand
            </Text>
            <View style={styles.confidenceRow}>
               <View style={[styles.confDot, { backgroundColor: colors[confidenceVariant] }]} />
               <Text style={[styles.confText, { color: colors[confidenceVariant] }]}>{forecast.confidence} Confidence</Text>
            </View>
          </View>
      </View>

      <View style={[styles.insightBox, { backgroundColor: colors.secondary + '05' }]}>
         <MaterialCommunityIcons name="lightbulb-outline" size={18} color={colors.secondary} />
         <View style={{flex: 1}}>
           {forecast.seasonalNote && (
              <Text style={[styles.seasonalNote, { color: colors.secondary }]}>
                {forecast.seasonalNote}
              </Text>
            )}
            <Text style={[styles.reasoning, { color: colors.textSecondary }]}>
              {forecast.reasoning}
            </Text>
         </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.reorderInfo}>
           <Text style={[styles.reorderLabel, { color: colors.textPlaceholder }]}>Recommended Next Order</Text>
           <Text style={[styles.reorderDay, { color: colors.textPrimary }]}>
             {forecast.recommendedQty} {forecast.unit} by <Text style={{ color: colors.primary }}>{forecast.bestReorderDay}</Text>
           </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.waBtn, { backgroundColor: '#25D366' }]}
          onPress={handleWhatsApp}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="whatsapp" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 24,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flex: 1, gap: 6 },
  name: { fontSize: 18, fontWeight: "900", letterSpacing: -0.5 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  aiBadgeText: { fontSize: 9, fontWeight: '900' },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  urgentText: { fontSize: 10, fontWeight: "900", color: "#fff" },
  stockSection: { gap: 8 },
  stockRow: { flexDirection: "row", justifyContent: "space-between" },
  stockLabel: { fontSize: 12, fontWeight: '600' },
  progressBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  predictionSection: { gap: 12 },
  tabBar: {
    flexDirection: "row",
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  tabText: { fontSize: 11, fontWeight: "900", letterSpacing: 0.5 },
  forecastBox: {
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 20,
    gap: 2,
  },
  valRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  forecastValue: { fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  unitText: { fontSize: 14, fontWeight: '700' },
  forecastLabel: { fontSize: 13, fontWeight: '600' },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  confDot: { width: 6, height: 6, borderRadius: 3 },
  confText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  insightBox: { flexDirection: 'row', padding: 16, borderRadius: 20, gap: 12 },
  seasonalNote: { fontSize: 13, fontWeight: '800', marginBottom: 2 },
  reasoning: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
  },
  reorderInfo: { flex: 1, gap: 2 },
  reorderLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  reorderDay: { fontSize: 14, fontWeight: "800" },
  waBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
