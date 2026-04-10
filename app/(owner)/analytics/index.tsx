import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";

import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/utils/formatCurrency";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

type Period = "7d" | "30d" | "all";

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activeStore, getBillsForStore, getDailySales } = useData();
  const [period, setPeriod] = useState<Period>("7d");

  const allBills = useMemo(
    () => getBillsForStore(activeStore?.id ?? ""),
    [activeStore?.id, getBillsForStore]
  );

  const filteredBills = useMemo(() => {
    if (period === "all") return allBills;
    const days = period === "7d" ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return allBills.filter((b) => new Date(b.createdAt) >= cutoff);
  }, [allBills, period]);

  const dailySales = useMemo(
    () => getDailySales(activeStore?.id ?? "", period === "7d" ? 7 : period === "30d" ? 30 : 14),
    [activeStore?.id, period, getDailySales]
  );

  const totalRevenue = filteredBills.reduce((s, b) => s + b.grandTotal, 0);
  const totalGST = filteredBills.reduce((s, b) => s + b.gstTotal, 0);
  const avgBillValue = filteredBills.length > 0 ? totalRevenue / filteredBills.length : 0;
  const maxSales = Math.max(...dailySales.map((d) => d.total), 1);

  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    filteredBills.forEach((b) => {
      b.items.forEach((item) => {
        if (!map[item.productId]) {
          map[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
        }
        map[item.productId].qty += item.quantity;
        map[item.productId].revenue += item.totalPrice;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredBills]);

  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredBills.forEach((b) => {
      map[b.paymentMode] = (map[b.paymentMode] || 0) + b.grandTotal;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredBills]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 30 : 10) }]}>
         <View style={styles.headerInfo}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Business Insights</Text>
            <View style={styles.subtitleRow}>
               <MaterialCommunityIcons name="finance" size={16} color={colors.primary} />
               <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Performance Overview</Text>
            </View>
         </View>
        <View style={[styles.periodToggle, { backgroundColor: colors.gray100 }]}>
          {(["7d", "30d", "all"] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.periodBtn, 
                period === p && { backgroundColor: colors.card, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4 }
              ]}
              onPress={() => setPeriod(p)}
              activeOpacity={0.8}
            >
              <Animated.Text style={[styles.periodText, { color: period === p ? colors.primary : colors.textSecondary }]}>
                {p === "all" ? "Live" : p}
              </Animated.Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsGrid}>
          <StatCard label="Total Revenue" value={totalRevenue} prefix="₹" icon="currency-inr" color="#10B981" colors={colors} delay={0} />
          <StatCard label="Bills Generated" value={filteredBills.length} icon="receipt" color="#6366F1" colors={colors} delay={50} />
          <StatCard label="Avg Order Value" value={avgBillValue} prefix="₹" icon="chart-line-variant" color="#F59E0B" colors={colors} delay={100} />
          <StatCard label="GST Payout" value={totalGST} prefix="₹" icon="percent" color="#EC4899" colors={colors} delay={150} />
        </View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <GlassCard style={styles.section} intensity={15} borderRadius={32}>
            <View style={styles.sectionHeader}>
               <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Revenue Trend</Text>
               <TouchableOpacity style={styles.infoBtn}>
                  <MaterialCommunityIcons name="information-outline" size={20} color={colors.textPlaceholder} />
               </TouchableOpacity>
            </View>
            <View style={styles.chartArea}>
              <View style={styles.bars}>
                {dailySales.map((day, i) => (
                  <View key={i} style={styles.barCol}>
                    <View style={styles.barWrapper}>
                      <LinearGradient
                        colors={i === dailySales.length - 1 ? [colors.primary, colors.success] : [colors.primary + '30', colors.primary + '10']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={[
                          styles.bar,
                          { height: Math.max(12, (day.total / maxSales) * 120) },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barDate, { color: colors.textSecondary }]} numberOfLines={1}>
                      {day.date.split(' ')[0]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {topProducts.length > 0 && (
          <Animated.View entering={FadeInDown.delay(250)}>
            <GlassCard style={styles.section} intensity={10} borderRadius={32}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 8 }]}>Top Sellers</Text>
              {topProducts.map((p, i) => (
                <View key={i} style={[styles.topProductRow, i !== topProducts.length - 1 && { borderBottomColor: colors.border + '40', borderBottomWidth: 1 }]}>
                  <View style={[styles.rankBadge, { backgroundColor: i === 0 ? colors.primary + '15' : colors.gray100 }]}>
                    <Text style={[styles.rankText, { color: i === 0 ? colors.primary : colors.textSecondary }]}>
                      #{i + 1}
                    </Text>
                  </View>
                  <View style={styles.topProductInfo}>
                    <Text style={[styles.topProductName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={[styles.topProductQty, { color: colors.textSecondary }]}>
                      {(p.qty || 0).toFixed(0)} units sold
                    </Text>
                  </View>
                  <View style={styles.topProductRight}>
                    <Text style={[styles.topProductRevenue, { color: colors.textPrimary }]}>
                      {formatCurrency(p.revenue)}
                    </Text>
                  </View>
                </View>
              ))}
            </GlassCard>
          </Animated.View>
        )}

        {paymentBreakdown.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300)}>
            <GlassCard style={styles.section} intensity={5} borderRadius={32}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 8 }]}>Payment Modes</Text>
              {paymentBreakdown.map(([mode, amount], i) => {
                const pct = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
                return (
                  <View key={mode} style={[styles.payRow, i !== paymentBreakdown.length - 1 && { borderBottomColor: colors.border + '30', borderBottomWidth: 1 }]}>
                    <View style={styles.payModeBox}>
                       <MaterialCommunityIcons 
                          name={mode === "UPI" ? "qrcode-scan" : mode === "Card" ? "credit-card-outline" : "cash"} 
                          size={18} 
                          color={colors.textSecondary} 
                       />
                       <Text style={[styles.payMode, { color: colors.textPrimary }]}>{mode}</Text>
                    </View>
                    <View style={styles.payBarWrapper}>
                       <Text style={[styles.payPct, { color: colors.textSecondary }]}>{pct.toFixed(0)}%</Text>
                       <View style={styles.payBar}>
                         <LinearGradient
                            colors={[colors.primary, colors.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.payBarFill, { width: `${pct}%` as any }]}
                         />
                       </View>
                    </View>
                    <Text style={[styles.payAmount, { color: colors.textPrimary }]}>
                      {formatCurrency(amount)}
                    </Text>
                  </View>
                );
              })}
            </GlassCard>
          </Animated.View>
        )}
      </ScrollView>

      {/* Decorative Orbs */}
      <View style={[styles.orb, { backgroundColor: colors.primary + '08', top: -50, right: -50 }]} />
      <View style={[styles.orb, { backgroundColor: colors.success + '05', bottom: 200, left: -100 }]} />
    </View>
  );
}

function StatCard({ label, value, prefix, icon, color, colors, delay }: {
  label: string;
  value: number;
  prefix?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  colors: any;
  delay: number;
}) {
  return (
    <Animated.View entering={ZoomIn.delay(delay)} style={styles.statCardWrapper}>
      <GlassCard intensity={12} borderRadius={28} style={styles.statCardInner}>
        <View style={styles.statTop}>
           <View style={[styles.statIconBox, { backgroundColor: color + "15" }]}>
             <MaterialCommunityIcons name={icon} size={22} color={color} />
           </View>
        </View>
        <View style={styles.statContent}>
          <AnimatedCounter 
             value={value} 
             prefix={prefix} 
             style={[styles.statValue, { color: colors.textPrimary }]} 
          />
          <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1}>{label}</Text>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
    zIndex: 10,
  },
  headerInfo: { flex: 1 },
  title: { fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  subtitle: { fontSize: 13, fontWeight: "800", textTransform: 'uppercase', letterSpacing: 0.5 },
  periodToggle: { 
    flexDirection: "row", 
    borderRadius: 20, 
    padding: 6, 
    gap: 4,
  },
  periodBtn: { 
     flex: 1,
     paddingVertical: 10, 
     borderRadius: 14,
     alignItems: 'center',
     justifyContent: 'center',
  },
  periodText: { fontSize: 14, fontWeight: "800", textTransform: 'uppercase', letterSpacing: 0.5 },
  content: { padding: 16, gap: 16 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  statCardWrapper: { width: "48%" },
  statCardInner: { padding: 20, gap: 16 },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statContent: { gap: 4 },
  statValue: { fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  statLabel: { fontSize: 13, fontWeight: '700' },
  section: {
    padding: 24,
    gap: 16,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: "900", letterSpacing: -0.3 },
  infoBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 18 },
  chartArea: { height: 180, marginTop: 8 },
  bars: { flexDirection: "row", alignItems: "flex-end", height: 150, gap: 6 },
  barCol: { flex: 1, alignItems: "center", gap: 10 },
  barWrapper: { flex: 1, justifyContent: "flex-end", width: "100%", alignItems: "center" },
  bar: { width: "100%", maxWidth: 36, borderRadius: 8, minHeight: 12 },
  barDate: { fontSize: 11, fontWeight: '800' },
  topProductRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 16 },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: { fontSize: 14, fontWeight: "900" },
  topProductInfo: { flex: 1, gap: 4 },
  topProductName: { fontSize: 16, fontWeight: "800" },
  topProductQty: { fontSize: 13, fontWeight: '700' },
  topProductRight: { alignItems: "flex-end", justifyContent: 'center' },
  topProductRevenue: { fontSize: 16, fontWeight: "900" },
  payRow: { flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 16 },
  payModeBox: { width: 80, flexDirection: 'row', alignItems: 'center', gap: 6 },
  payMode: { fontSize: 14, fontWeight: "800" },
  payBarWrapper: { flex: 1, gap: 6 },
  payPct: { fontSize: 11, fontWeight: '800' },
  payBar: { height: 8, backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 4, overflow: "hidden" },
  payBarFill: { height: "100%", borderRadius: 4 },
  payAmount: { fontSize: 15, fontWeight: "900", minWidth: 60, textAlign: "right" },
  orb: { position: 'absolute', width: 300, height: 300, borderRadius: 150, zIndex: -1 },
});
