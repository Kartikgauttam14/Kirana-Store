import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { StoreHeader } from "@/components/owner/StoreHeader";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { getStockStatus } from "@/types/inventory.types";
import { formatCurrency } from "@/utils/formatCurrency";
import { GlassCard } from "@/components/ui/GlassCard";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeStore, getBillsForStore, getProductsForStore, getDailySales } = useData();

  const storeId = activeStore?.id ?? "";
  const bills = useMemo(() => getBillsForStore(storeId), [storeId, getBillsForStore]);
  const products = useMemo(() => getProductsForStore(storeId), [storeId, getProductsForStore]);
  const dailySales = useMemo(() => getDailySales(storeId, 7), [storeId, getDailySales]);

  const today = new Date().toISOString().split("T")[0];
  const todayBills = bills.filter((b) => b.createdAt.startsWith(today));
  const todayRevenue = todayBills.reduce((s, b) => s + b.grandTotal, 0);
  const lowStockItems = products.filter((p) => getStockStatus(p) !== "inStock");

  const maxSales = Math.max(...dailySales.map((d) => d.total), 1);

  const quickActions = [
    { label: "New Sale", icon: "plus-circle" as const, route: "/(owner)/billing/index", color: colors.primary },
    { label: "Inventory", icon: "package" as const, route: "/(owner)/inventory/index", color: colors.secondary },
    { label: "AI Forecast", icon: "cpu" as const, route: "/(owner)/forecast/index", color: colors.success },
    { label: "Analytics", icon: "trending-up" as const, route: "/(owner)/analytics/index", color: "#F59E0B" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StoreHeader />
      
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Executive Summary</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
            <Animated.View entering={FadeInRight.delay(100)}>
              <GlassCard style={styles.summaryCard} intensity={20}>
                <View style={[styles.iconCircle, { backgroundColor: colors.successLight }]}>
                  <Feather name="dollar-sign" size={20} color={colors.success} />
                </View>
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{formatCurrency(todayRevenue)}</Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Revenue Today</Text>
              </GlassCard>
            </Animated.View>

            <Animated.View entering={FadeInRight.delay(200)}>
              <GlassCard style={styles.summaryCard} intensity={20}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                  <Feather name="file-text" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{todayBills.length}</Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Bills Generated</Text>
              </GlassCard>
            </Animated.View>

            <Animated.View entering={FadeInRight.delay(300)}>
              <GlassCard style={styles.summaryCard} intensity={20}>
                <View style={[styles.iconCircle, { backgroundColor: colors.dangerLight }]}>
                  <Feather name="alert-triangle" size={20} color={colors.danger} />
                </View>
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{lowStockItems.length}</Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Stock Alerts</Text>
              </GlassCard>
            </Animated.View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Access</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, idx) => (
              <Animated.View 
                key={action.label} 
                entering={FadeInDown.delay(400 + idx * 100)} 
                style={styles.actionItem}
              >
                <TouchableOpacity
                  onPress={() => router.push(action.route as any)}
                  activeOpacity={0.8}
                >
                  <GlassCard style={styles.actionCard} intensity={10} borderRadius={20}>
                    <View style={[styles.actionIcon, { backgroundColor: action.color + "15" }]}>
                      <Feather name={action.icon} size={24} color={action.color} />
                    </View>
                    <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>{action.label}</Text>
                  </GlassCard>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Performance Insights</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAll, { color: colors.primary }]}>Details</Text>
            </TouchableOpacity>
          </View>
          
          <GlassCard intensity={15} style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>Weekly Sales</Text>
                <Text style={[styles.chartSub, { color: colors.textSecondary }]}>Revenue trend from last 7 days</Text>
              </View>
              <Feather name="trending-up" size={20} color={colors.success} />
            </View>

            <View style={styles.bars}>
              {dailySales.map((day, i) => (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barWrapper}>
                    <LinearGradient
                      colors={i === dailySales.length - 1 ? [colors.primary, colors.warning] : [colors.gray300, colors.gray100]}
                      style={[
                        styles.bar,
                        { height: Math.max(4, (day.total / maxSales) * 120) }
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                    {day.date.split("-")[2]}
                  </Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </View>

        {lowStockItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Critical Alerts</Text>
              <TouchableOpacity onPress={() => router.push("/(owner)/inventory/index" as any)}>
                <Text style={[styles.viewAll, { color: colors.primary }]}>Manage</Text>
              </TouchableOpacity>
            </View>
            {lowStockItems.slice(0, 3).map((p, idx) => (
              <Animated.View key={p.id} entering={FadeInDown.delay(700 + idx * 100)}>
                <GlassCard intensity={8} style={styles.alertCard} borderRadius={16}>
                  <View style={[styles.alertIcon, { backgroundColor: colors.dangerLight }]}>
                    <Feather name="alert-circle" size={16} color={colors.danger} />
                  </View>
                  <View style={styles.alertInfo}>
                    <Text style={[styles.alertName, { color: colors.textPrimary }]}>{p.name}</Text>
                    <Text style={[styles.alertStock, { color: colors.danger }]}>
                      {p.currentStock <= 0 ? "Out of Stock" : `Low: ${p.currentStock} ${p.unit}`}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.adjustBtn, { backgroundColor: colors.primary }]}
                    onPress={() => router.push({ pathname: "/(owner)/inventory/edit-product", params: { id: p.id } } as any)}
                  >
                    <Text style={styles.adjustText}>Refill</Text>
                  </TouchableOpacity>
                </GlassCard>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { gap: 10, paddingVertical: 10 },
  section: { paddingHorizontal: 20, paddingTop: 10 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 20, fontWeight: "800", marginBottom: 12, letterSpacing: -0.5 },
  viewAll: { fontSize: 14, fontWeight: "600" },
  cardsRow: { gap: 12, paddingBottom: 10 },
  summaryCard: {
    width: 150,
    height: 160,
    justifyContent: "center",
    padding: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  summaryValue: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  summaryLabel: { fontSize: 13, fontWeight: "500" },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionItem: {
    width: (width - 52) / 2,
  },
  actionCard: {
    padding: 16,
    alignItems: "center",
    gap: 12,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { fontSize: 15, fontWeight: "700" },
  chartContainer: {
    padding: 20,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  chartTitle: { fontSize: 18, fontWeight: "700" },
  chartSub: { fontSize: 13, marginTop: 4 },
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 140,
    gap: 12,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  barWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
  },
  bar: {
    width: "100%",
    borderRadius: 6,
  },
  barLabel: { fontSize: 10, fontWeight: "600", opacity: 0.6 },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  alertInfo: { flex: 1 },
  alertName: { fontSize: 15, fontWeight: "700" },
  alertStock: { fontSize: 13, marginTop: 2, fontWeight: "600" },
  adjustBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  adjustText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});
