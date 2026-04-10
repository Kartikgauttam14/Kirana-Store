import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
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
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { ForecastCard } from "@/components/owner/ForecastCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";
import { PRODUCT_CATEGORIES } from "@/constants/categories";
import { analyzeProductDemand } from "@/utils/aiEngine";

export default function ForecastScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const language = useAuthStore((s) => s.language);
  const { activeStore, getProductsForStore, getBillsForStore, forecasts, setForecasts } = useData();

  const products = useMemo(
    () => getProductsForStore(activeStore?.id ?? ""),
    [activeStore?.id, getProductsForStore]
  );

  const bills = useMemo(
    () => getBillsForStore(activeStore?.id ?? ""),
    [activeStore?.id, getBillsForStore]
  );

  const storeForecast = useMemo(
    () => forecasts.filter((f) => f.storeId === activeStore?.id),
    [forecasts, activeStore?.id]
  );

  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [showRestockOnly, setShowRestockOnly] = useState(false);

  const handleAnalyzeAll = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate complex AI processing time
    await new Promise((r) => setTimeout(r, 1500));
    
    const newForecasts = products.map((p) =>
      analyzeProductDemand(p, bills, language)
    );
    
    const otherStoreForecasts = forecasts.filter((f) => f.storeId !== activeStore?.id);
    setForecasts([...otherStoreForecasts, ...newForecasts]);
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 20 : 10) }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
             <Feather name="chevron-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={[styles.subtitle, { color: colors.primary }]}>
               {language === 'hi' ? "ऑर्गेनिक इंटेलिजेंस" : "Organic Intelligence"}
            </Text>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
               {language === 'hi' ? "मांग का पूर्वानुमान" : "Demand Forecast"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.analyzeBtnContainer}
          onPress={handleAnalyzeAll}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
             colors={loading ? [colors.gray300, colors.gray300] : [colors.primary, '#4F46E5']}
             start={{x: 0, y: 0}}
             end={{x: 1, y: 0}}
             style={styles.btnGradient}
          >
            {loading ? (
              <LoadingSpinner size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="auto-fix" size={20} color="#fff" />
                <Text style={styles.analyzeBtnText}>
                  {language === 'hi' ? "डेटा का विश्लेषण करें" : "Refresh Intelligence"}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView 
        stickyHeaderIndices={[1]} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {urgentCount > 0 && (
          <Animated.View entering={FadeInUp} style={styles.urgentWrapper}>
             <TouchableOpacity
               onPress={() => setShowRestockOnly(!showRestockOnly)}
               activeOpacity={0.9}
             >
               <LinearGradient
                 colors={[colors.danger, colors.accent]}
                 start={{ x: 0, y: 0 }}
                 end={{ x: 1, y: 0 }}
                 style={styles.urgentBanner}
               >
                 <MaterialCommunityIcons name="alert-decagram" size={24} color="#fff" />
                 <View style={{flex: 1}}>
                    <Text style={styles.urgentText}>Critical Shortage Alert</Text>
                    <Text style={styles.urgentSub}>{urgentCount} items need immediate refill</Text>
                 </View>
                 <View style={styles.urgentActionBox}>
                    <Text style={styles.urgentActionText}>{showRestockOnly ? "Show All" : "Fix Now"}</Text>
                 </View>
               </LinearGradient>
             </TouchableOpacity>
          </Animated.View>
        )}

        <View style={[styles.filterRow, { backgroundColor: colors.background }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterCategory === "all" && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setFilterCategory("all")}
            >
              <Text style={[styles.filterText, { color: filterCategory === "all" ? "#fff" : colors.textSecondary }]}>All</Text>
            </TouchableOpacity>
            {PRODUCT_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.filterChip,
                  filterCategory === cat.id && { backgroundColor: colors.primary, borderColor: colors.primary },
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
              Organic Intelligence is crunching sales data...
            </Text>
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="cpu"
            title="No insights yet"
            subtitle={
              storeForecast.length === 0
                ? "Generate AI-powered demand forecasts to optimize your stock levels."
                : "No items match your filter selection."
            }
            actionLabel={storeForecast.length === 0 ? "Start AI Analysis" : undefined}
            onAction={storeForecast.length === 0 ? handleAnalyzeAll : undefined}
          />
        ) : (
          <View style={styles.list}>
            {filtered.map((item, idx) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(idx * 50)}>
                 <ForecastCard forecast={item} />
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Background Orbs */}
      <View style={[styles.orb, { backgroundColor: colors.primary + '05', top: 100, right: -50 }]} />
      <View style={[styles.orb, { backgroundColor: colors.success + '05', bottom: 100, left: -50 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.02)' },
  headerInfo: { flex: 1 },
  title: { fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontWeight: "800", textTransform: 'uppercase', letterSpacing: 0.5 },
  analyzeBtnContainer: {
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  btnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 20 },
  analyzeBtnText: { color: "#fff", fontWeight: "900", fontSize: 15, letterSpacing: 0.5 },
  urgentWrapper: { padding: 16 },
  urgentBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 18,
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  urgentText: { fontSize: 16, fontWeight: "900", color: "#fff" },
  urgentSub: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  urgentActionBox: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  urgentActionText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  filterRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.03)' },
  filterScroll: { paddingHorizontal: 16, gap: 10 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  filterText: { fontSize: 13, fontWeight: "800" },
  loadingContainer: { minHeight: 400, alignItems: "center", justifyContent: "center", gap: 16, padding: 40 },
  loadingText: { fontSize: 15, textAlign: "center", fontWeight: '700', lineHeight: 22 },
  list: { paddingTop: 8 },
  orb: { position: 'absolute', width: 250, height: 250, borderRadius: 125, zIndex: -1 },
});
