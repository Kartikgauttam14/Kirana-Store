import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ForecastCard } from "@/components/owner/ForecastCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { Forecast } from "@/types/forecast.types";
import { PRODUCT_CATEGORIES } from "@/constants/categories";

const CONFIDENCE_LEVELS: Array<"Low" | "Medium" | "High"> = ["Low", "Medium", "High"];

function generateMockForecast(product: any, storeId: string): Forecast {
  const avgDailySales = 2 + Math.random() * 8;
  const confidence = product.currentStock < product.reorderLevel
    ? "High"
    : product.currentStock < product.reorderLevel * 1.5
    ? "Medium"
    : "Low";

  const forecast7d = +(avgDailySales * 7 * (0.9 + Math.random() * 0.3)).toFixed(1);
  const forecast14d = +(avgDailySales * 14 * (0.9 + Math.random() * 0.3)).toFixed(1);
  const forecast30d = +(avgDailySales * 30 * (0.9 + Math.random() * 0.3)).toFixed(1);
  const restockNow = product.currentStock < forecast7d;

  const festivals = ["Diwali", "Holi", "Navratri", "Eid"];
  const hasFestival = Math.random() > 0.6;
  const festival = festivals[Math.floor(Math.random() * festivals.length)];

  return {
    id: `forecast_${product.id}_${Date.now()}`,
    productId: product.id,
    storeId,
    productName: product.name,
    productCategory: product.category,
    currentStock: product.currentStock,
    reorderLevel: product.reorderLevel,
    unit: product.unit,
    supplierName: product.supplierName,
    supplierPhone: product.supplierPhone,
    forecast7d,
    forecast14d,
    forecast30d,
    restockNow,
    recommendedQty: product.reorderQty,
    bestReorderDay: restockNow ? "Today" : "Monday",
    seasonalNote: hasFestival
      ? `Expect ${15 + Math.floor(Math.random() * 30)}% surge due to upcoming ${festival}`
      : undefined,
    confidence,
    reasoning: restockNow
      ? `Current stock of ${product.currentStock} ${product.unit} will not last the next 7 days based on recent sales trends. Order ${product.reorderQty} ${product.unit} immediately.`
      : `Sales are steady. Consider restocking on Monday when demand typically rises to avoid weekend shortages.`,
    generatedAt: new Date().toISOString(),
  };
}

export default function ForecastScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activeStore, getProductsForStore, forecasts, setForecasts } = useData();

  const products = useMemo(
    () => getProductsForStore(activeStore?.id ?? ""),
    [activeStore?.id, getProductsForStore]
  );

  const storeForecast = useMemo(
    () => forecasts.filter((f) => f.storeId === activeStore?.id),
    [forecasts, activeStore?.id]
  );

  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [showRestockOnly, setShowRestockOnly] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const handleAnalyzeAll = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((r) => setTimeout(r, 2000));
    const newForecasts = products.map((p) =>
      generateMockForecast(p, activeStore?.id ?? "")
    );
    const otherStoreForecasts = forecasts.filter((f) => f.storeId !== activeStore?.id);
    setForecasts([...otherStoreForecasts, ...newForecasts]);
    setLastUpdated(new Date().toLocaleTimeString("en-IN"));
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const filtered = useMemo(() => {
    let list = storeForecast;
    if (filterCategory !== "all") {
      list = list.filter((f) => f.productCategory === filterCategory);
    }
    if (showRestockOnly) {
      list = list.filter((f) => f.restockNow);
    }
    return list.sort((a, b) => (b.restockNow ? 1 : 0) - (a.restockNow ? 1 : 0));
  }, [storeForecast, filterCategory, showRestockOnly]);

  const urgentCount = storeForecast.filter((f) => f.restockNow).length;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) },
      ]}
    >
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>AI Demand Forecast</Text>
          {lastUpdated && (
            <Text style={[styles.updated, { color: colors.textSecondary }]}>
              Last updated: {lastUpdated}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.analyzeBtn, { backgroundColor: loading ? colors.muted : colors.primary }]}
          onPress={handleAnalyzeAll}
          disabled={loading}
        >
          {loading ? (
            <LoadingSpinner size="small" color="#fff" />
          ) : (
            <>
              <Feather name="cpu" size={16} color="#fff" />
              <Text style={styles.analyzeBtnText}>Analyze All</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {urgentCount > 0 && (
        <TouchableOpacity
          style={[styles.urgentBanner, { backgroundColor: colors.dangerLight }]}
          onPress={() => setShowRestockOnly(!showRestockOnly)}
        >
          <Feather name="alert-triangle" size={16} color={colors.danger} />
          <Text style={[styles.urgentText, { color: colors.danger }]}>
            {urgentCount} product{urgentCount !== 1 ? "s" : ""} need immediate restocking
          </Text>
          <Text style={[styles.urgentAction, { color: colors.danger }]}>
            {showRestockOnly ? "Show All" : "View"}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: filterCategory === "all" ? colors.primary : colors.card, borderColor: filterCategory === "all" ? colors.primary : colors.border },
            ]}
            onPress={() => setFilterCategory("all")}
          >
            <Text style={[styles.filterText, { color: filterCategory === "all" ? "#fff" : colors.textSecondary }]}>
              All
            </Text>
          </TouchableOpacity>
          {PRODUCT_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.filterChip,
                { backgroundColor: filterCategory === cat.id ? colors.primary : colors.card, borderColor: filterCategory === cat.id ? colors.primary : colors.border },
              ]}
              onPress={() => setFilterCategory(cat.id)}
            >
              <Text style={[styles.filterText, { color: filterCategory === cat.id ? "#fff" : colors.textSecondary }]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            AI is analyzing sales patterns...
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="cpu"
          title="No forecast data yet"
          subtitle={
            storeForecast.length === 0
              ? "Tap 'Analyze All' to generate AI-powered forecasts for all products"
              : "No products match the current filters"
          }
          actionLabel={storeForecast.length === 0 ? "Analyze All Products" : undefined}
          onAction={storeForecast.length === 0 ? handleAnalyzeAll : undefined}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ForecastCard forecast={item} />}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  title: { fontSize: 22, fontWeight: "800" },
  updated: { fontSize: 12, marginTop: 2 },
  analyzeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 90,
    justifyContent: "center",
  },
  analyzeBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  urgentBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 16,
    marginBottom: 0,
    padding: 14,
    borderRadius: 12,
  },
  urgentText: { flex: 1, fontSize: 14, fontWeight: "600" },
  urgentAction: { fontWeight: "700", fontSize: 14 },
  filterRow: { paddingVertical: 12 },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: "600" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 15, textAlign: "center" },
  list: { paddingTop: 12 },
});
