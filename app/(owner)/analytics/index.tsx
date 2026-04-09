import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/utils/formatCurrency";

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
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) },
      ]}
    >
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Analytics</Text>
        <View style={[styles.periodToggle, { backgroundColor: colors.muted }]}>
          {(["7d", "30d", "all"] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && { backgroundColor: colors.primary }]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, { color: period === p ? "#fff" : colors.mutedForeground }]}>
                {p === "all" ? "All" : p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsGrid}>
          <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} icon="dollar-sign" color={colors.success} bg={colors.successLight} colors={colors} />
          <StatCard label="Total Bills" value={String(filteredBills.length)} icon="file-text" color={colors.primary} bg={colors.primaryLight} colors={colors} />
          <StatCard label="Avg Bill Value" value={formatCurrency(avgBillValue)} icon="trending-up" color={colors.secondary} bg="#E8F0FE" colors={colors} />
          <StatCard label="GST Collected" value={formatCurrency(totalGST)} icon="percent" color="#F57C00" bg="#FFF8E1" colors={colors} />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Sales Trend</Text>
          <View style={styles.chartArea}>
            <View style={styles.bars}>
              {dailySales.map((day, i) => (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(4, (day.total / maxSales) * 130),
                          backgroundColor: i === dailySales.length - 1 ? colors.primary : colors.gray300,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barDate, { color: colors.textSecondary }]} numberOfLines={1}>
                    {day.date}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {topProducts.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Top Selling Products</Text>
            {topProducts.map((p, i) => (
              <View key={i} style={styles.topProductRow}>
                <View style={[styles.rankBadge, { backgroundColor: i === 0 ? colors.warning : colors.muted }]}>
                  <Text style={[styles.rankText, { color: i === 0 ? "#fff" : colors.mutedForeground }]}>
                    #{i + 1}
                  </Text>
                </View>
                <Text style={[styles.topProductName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {p.name}
                </Text>
                <View style={styles.topProductRight}>
                  <Text style={[styles.topProductRevenue, { color: colors.primary }]}>
                    {formatCurrency(p.revenue)}
                  </Text>
                  <Text style={[styles.topProductQty, { color: colors.textSecondary }]}>
                    Qty: {p.qty.toFixed(0)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {paymentBreakdown.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Payment Breakdown</Text>
            {paymentBreakdown.map(([mode, amount]) => {
              const pct = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
              return (
                <View key={mode} style={styles.payRow}>
                  <Text style={[styles.payMode, { color: colors.textPrimary }]}>{mode}</Text>
                  <View style={styles.payBar}>
                    <View style={[styles.payBarFill, { width: `${pct}%` as any, backgroundColor: colors.primary }]} />
                  </View>
                  <Text style={[styles.payAmount, { color: colors.textSecondary }]}>
                    {pct.toFixed(0)}%
                  </Text>
                  <Text style={[styles.payAmount, { color: colors.primary }]}>
                    {formatCurrency(amount)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({ label, value, icon, color, bg, colors }: {
  label: string;
  value: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  bg: string;
  colors: any;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Feather name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontWeight: "800" },
  periodToggle: { flexDirection: "row", borderRadius: 10, padding: 3, gap: 2 },
  periodBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  periodText: { fontSize: 13, fontWeight: "600" },
  content: { padding: 16, gap: 16 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 12 },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  chartArea: { height: 150 },
  bars: { flexDirection: "row", alignItems: "flex-end", height: 130, gap: 6 },
  barCol: { flex: 1, alignItems: "center", gap: 4 },
  barWrapper: { flex: 1, justifyContent: "flex-end", width: "100%", alignItems: "center" },
  bar: { width: "80%", borderRadius: 4, minHeight: 4 },
  barDate: { fontSize: 9, textAlign: "center" },
  topProductRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: { fontSize: 12, fontWeight: "700" },
  topProductName: { flex: 1, fontSize: 14, fontWeight: "600" },
  topProductRight: { alignItems: "flex-end" },
  topProductRevenue: { fontSize: 14, fontWeight: "700" },
  topProductQty: { fontSize: 12 },
  payRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  payMode: { width: 60, fontSize: 13, fontWeight: "600" },
  payBar: { flex: 1, height: 8, backgroundColor: "#F0F0F0", borderRadius: 4, overflow: "hidden" },
  payBarFill: { height: "100%", borderRadius: 4 },
  payAmount: { fontSize: 12, fontWeight: "600", minWidth: 35, textAlign: "right" },
});
