import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
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
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInRight, ZoomIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { StoreHeader } from "@/components/owner/StoreHeader";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";
import { getStockStatus } from "@/types/inventory.types";
import { formatCurrency } from "@/utils/formatCurrency";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeStore, getBillsForStore, getProductsForStore, getDailySales } = useData();
  const language = useAuthStore((s) => s.language);

  const storeId = activeStore?.id ?? "";
  const bills = useMemo(() => getBillsForStore(storeId), [storeId, getBillsForStore]);
  const products = useMemo(() => getProductsForStore(storeId), [storeId, getProductsForStore]);
  const dailySales = useMemo(() => getDailySales(storeId, 7), [storeId, getDailySales]);

  // Subscribe to live order updates from Supabase Realtime
  useRealtimeOrders(storeId);

  const today = new Date().toISOString().split("T")[0];
  const todayBills = bills.filter((b) => b.createdAt.startsWith(today));
  const todayRevenue = todayBills.reduce((s, b) => s + b.grandTotal, 0);
  const lowStockItems = products.filter((p) => getStockStatus(p) !== "inStock");

  const maxSales = Math.max(...dailySales.map((d) => d.total), 1);

  const quickActions = [
    { label: language === 'hi' ? "नई बिक्री" : "New Sale", icon: "plus-circle" as const, route: "/(owner)/billing/index", color: colors.primary, mIcon: "calculator-variant" },
    { label: language === 'hi' ? "इन्वेंटरी" : "Inventory", icon: "package" as const, route: "/(owner)/inventory/index", color: colors.secondary, mIcon: "package-variant-closed" },
    { label: language === 'hi' ? "एआई भविष्य" : "AI Forecast", icon: "cpu" as const, route: "/(owner)/forecast/index", color: colors.success, mIcon: "brain" },
    { label: language === 'hi' ? "एनालिटिक्स" : "Analytics", icon: "trending-up" as const, route: "/(owner)/analytics/index", color: colors.accent, mIcon: "chart-timeline-variant" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <StoreHeader />
      
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {language === 'hi' ? "कार्यकारी सारांश" : "Executive Summary"}
            </Text>
            <View style={styles.liveIndicator}>
               <View style={[styles.pulseDot, { backgroundColor: colors.success }]} />
               <Text style={[styles.liveText, { color: colors.success }]}>
                 {language === 'hi' ? "लाइव" : "LIVE"}
               </Text>
            </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
            <Animated.View entering={FadeInRight.delay(100)}>
              <GlassCard style={styles.summaryCard} intensity={20}>
                <LinearGradient
                  colors={[colors.success + '20', colors.success + '05']}
                  style={styles.summaryGradient}
                />
                <View style={[styles.iconCircle, { backgroundColor: colors.success + '15' }]}>
                  <MaterialCommunityIcons name="currency-inr" size={24} color={colors.success} />
                </View>
                <AnimatedCounter 
                  value={todayRevenue} 
                  prefix="₹" 
                  style={[styles.summaryValue, { color: colors.textPrimary }]} 
                />
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  {language === 'hi' ? "आज की कमाई" : "Revenue Today"}
                </Text>
                <View style={styles.trendRow}>
                   <Feather name="trending-up" size={12} color={colors.success} />
                   <Text style={[styles.trendText, { color: colors.success }]}>+12.5%</Text>
                </View>
              </GlassCard>
            </Animated.View>

            <Animated.View entering={FadeInRight.delay(200)}>
              <GlassCard style={styles.summaryCard} intensity={20}>
                <LinearGradient
                  colors={[colors.primary + '20', colors.primary + '05']}
                  style={styles.summaryGradient}
                />
                <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
                  <MaterialCommunityIcons name="receipt" size={24} color={colors.primary} />
                </View>
                <AnimatedCounter 
                  value={todayBills.length} 
                  style={[styles.summaryValue, { color: colors.textPrimary }]} 
                />
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  {language === 'hi' ? "कुल बिल" : "Bills Generated"}
                </Text>
                <Text style={[styles.summarySub, { color: colors.textPlaceholder }]}>
                   {language === 'hi' ? "आज की भीड़" : "Today's traffic"}
                </Text>
              </GlassCard>
            </Animated.View>

            <Animated.View entering={FadeInRight.delay(300)}>
              <GlassCard style={styles.summaryCard} intensity={20}>
                <LinearGradient
                  colors={[colors.danger + '20', colors.danger + '05']}
                  style={styles.summaryGradient}
                />
                <View style={[styles.iconCircle, { backgroundColor: colors.danger + '15' }]}>
                  <MaterialCommunityIcons name="alert-decagram-outline" size={24} color={colors.danger} />
                </View>
                <AnimatedCounter 
                  value={lowStockItems.length} 
                  style={[styles.summaryValue, { color: colors.textPrimary }]} 
                />
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  {language === 'hi' ? "स्टॉक अलर्ट" : "Stock Alerts"}
                </Text>
                <Text style={[styles.summarySub, { color: colors.danger }]}>
                  {language === 'hi' ? "ध्यान दें" : "Needs Attention"}
                </Text>
              </GlassCard>
            </Animated.View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {language === 'hi' ? "त्वरित पहुँच" : "Quick Access"}
          </Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, idx) => (
              <Animated.View 
                key={action.label} 
                entering={ZoomIn.delay(400 + idx * 100)} 
                style={styles.actionItem}
              >
                <TouchableOpacity
                  onPress={() => router.push(action.route as any)}
                  activeOpacity={0.8}
                >
                  <GlassCard style={styles.actionCard} intensity={15} borderRadius={28}>
                    <LinearGradient
                      colors={[action.color, action.color + 'CC']}
                      style={styles.actionIcon}
                    >
                      <MaterialCommunityIcons name={action.mIcon as any} size={32} color="#fff" />
                    </LinearGradient>
                    <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>{action.label}</Text>
                  </GlassCard>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {language === 'hi' ? "प्रदर्शन रुझान" : "Performance Trend"}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(owner)/analytics/index" as any)}>
              <Text style={[styles.viewAll, { color: colors.primary }]}>
                {language === 'hi' ? "विस्तृत आँकड़े" : "Detailed Stats"}
              </Text>
            </TouchableOpacity>
          </View>
          
          <GlassCard intensity={15} style={styles.chartContainer} borderRadius={32}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
                  {language === 'hi' ? "साप्ताहिक राजस्व" : "Weekly Revenue"}
                </Text>
                <Text style={[styles.chartSub, { color: colors.textSecondary }]}>
                   {language === 'hi' ? "7 दिनों की बिक्री दक्षता" : "Sales efficiency over 7 days"}
                </Text>
              </View>
              <View style={[styles.chartBadge, { backgroundColor: colors.success + '15' }]}>
                 <Text style={[styles.chartBadgeText, { color: colors.success }]}>UP 8.4%</Text>
              </View>
            </View>

            <View style={styles.bars}>
              {dailySales.map((day, i) => {
                const isCurrent = i === dailySales.length - 1;
                return (
                  <View key={i} style={styles.barCol}>
                    <View style={styles.barWrapper}>
                      <LinearGradient
                        colors={isCurrent ? [colors.primary, colors.success] : ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.02)']}
                        style={[
                          styles.bar,
                          { height: Math.max(8, (day.total / maxSales) * 120) }
                        ]}
                      />
                      {isCurrent && <View style={[styles.barGlow, { backgroundColor: colors.primary }]} />}
                    </View>
                    <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
                      {day.date.split("-")[2]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </GlassCard>
        </View>

        {lowStockItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                {language === 'hi' ? "त्वरित स्टॉक सुधार" : "Quick Inventory Fix"}
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.alertsRow}>
              {lowStockItems.slice(0, 5).map((p, idx) => (
                <Animated.View key={p.id} entering={FadeInRight.delay(700 + idx * 100)}>
                  <GlassCard intensity={10} style={styles.alertCard} borderRadius={24}>
                    <View style={[styles.alertIcon, { backgroundColor: colors.danger + '10' }]}>
                      <MaterialCommunityIcons name="package-variant-minus" size={20} color={colors.danger} />
                    </View>
                    <Text style={[styles.alertName, { color: colors.textPrimary }]} numberOfLines={1}>{p.name}</Text>
                    <Text style={[styles.alertStock, { color: colors.danger }]}>
                      {p.currentStock <= 0 ? (language === 'hi' ? "आउट ऑफ स्टॉक" : "Out of Stock") : `${p.currentStock} ${p.unit} ${language === 'hi' ? "शेष" : "left"}`}
                    </Text>
                    <TouchableOpacity 
                      style={[styles.adjustBtn, { backgroundColor: colors.primary }]}
                      onPress={() => router.push({ pathname: "/(owner)/inventory/edit-product", params: { id: p.id } } as any)}
                    >
                      <Text style={styles.adjustText}>
                        {language === 'hi' ? "स्टॉक भरें" : "Restock"}
                      </Text>
                    </TouchableOpacity>
                  </GlassCard>
                </Animated.View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Background Graphic */}
      <View style={[styles.blurCircle, { backgroundColor: colors.primary + '10', top: 200, left: -100 }]} />
      <View style={[styles.blurCircle, { backgroundColor: colors.secondary + '08', bottom: 100, right: -150, width: 400, height: 400 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { gap: 20, paddingVertical: 10 },
  section: { paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 22, fontWeight: "900", letterSpacing: -0.8 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, elevation: 2 },
  pulseDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  viewAll: { fontSize: 14, fontWeight: "800" },
  cardsRow: { gap: 16, paddingRight: 20, paddingBottom: 10 },
  summaryCard: {
    width: 170,
    height: 180,
    justifyContent: "center",
    padding: 20,
    overflow: 'hidden',
  },
  summaryGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  summaryValue: { fontSize: 26, fontWeight: "900", marginBottom: 2, letterSpacing: -0.5 },
  summaryLabel: { fontSize: 13, fontWeight: "700" },
  summarySub: { fontSize: 11, fontWeight: '600', marginTop: 4 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  trendText: { fontSize: 12, fontWeight: '800' },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  actionItem: {
    width: (width - 56) / 2,
  },
  actionCard: {
    padding: 20,
    alignItems: "center",
    gap: 14,
  },
  actionIcon: {
    width: 70,
    height: 70,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: '#B46414',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  actionLabel: { fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
  chartContainer: {
    padding: 24,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  chartTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.4 },
  chartSub: { fontSize: 13, marginTop: 2, fontWeight: '600' },
  chartBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  chartBadgeText: { fontSize: 11, fontWeight: '900' },
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 140,
    gap: 14,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    gap: 10,
  },
  barWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: 14,
    borderRadius: 7,
  },
  barGlow: {
    position: 'absolute',
    bottom: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.2,
    zIndex: -1,
  },
  barLabel: { fontSize: 11, fontWeight: "800", opacity: 0.4 },
  alertsRow: { gap: 16, paddingRight: 20 },
  alertCard: {
    width: 160,
    padding: 16,
    gap: 10,
    alignItems: 'center',
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  alertName: { fontSize: 15, fontWeight: "800", textAlign: 'center' },
  alertStock: { fontSize: 13, fontWeight: "700" },
  adjustBtn: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  adjustText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  blurCircle: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    zIndex: -1,
  },
});
