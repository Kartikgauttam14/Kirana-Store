import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import { ProductCard } from "@/components/owner/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";
import { Product, getStockStatus } from "@/types/inventory.types";
import { GlassCard } from "@/components/ui/GlassCard";

type FilterType = "all" | "low" | "out" | "expiring";

export default function InventoryScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeStore, getProductsForStore, deleteProduct } = useData();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const language = useAuthStore((s) => s.language);

  const allProducts = useMemo(
    () => getProductsForStore(activeStore?.id ?? ""),
    [activeStore?.id, getProductsForStore]
  );

  const filtered = useMemo(() => {
    let list = allProducts;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (filter === "low")
      list = list.filter((p) => getStockStatus(p) === "lowStock");
    if (filter === "out")
      list = list.filter((p) => getStockStatus(p) === "outOfStock");
    if (filter === "expiring") {
      const soon = new Date();
      soon.setDate(soon.getDate() + 7);
      list = list.filter(
        (p) => p.expiryDate && new Date(p.expiryDate) <= soon
      );
    }
    return list;
  }, [allProducts, search, filter]);

  const filters: Array<{ key: FilterType; label: string; labelHindi: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = [
    { key: "all", label: "All Items", labelHindi: "सभी आइटम", icon: "view-dashboard-outline" as any },
    { key: "low", label: "Refill Soon", labelHindi: "कम स्टॉक", icon: "package-variant-closed" as any },
    { key: "out", label: "Sold Out", labelHindi: "खत्म स्टॉक", icon: "alert-octagon-outline" as any },
    { key: "expiring", label: "Expiring", labelHindi: "खराब होने वाले", icon: "clock-alert-outline" as any },
  ];

  const handleDelete = (product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    deleteProduct(product.id);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <BlurView
        intensity={60}
        tint="light"
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 30 : 10) }]}
      >
         <View style={styles.headerInfo}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {language === 'hi' ? "स्मार्ट स्टॉक" : "Smart Inventory"}
            </Text>
            <View style={styles.subtitleRow}>
               <MaterialCommunityIcons name="cube-scan" size={16} color={colors.primary} />
               <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                 {language === 'hi' ? "स्टोर कैटलॉग" : "Store Catalog"}
               </Text>
            </View>
         </View>
         <TouchableOpacity 
           style={[styles.statsBtn, { backgroundColor: colors.gray100, borderColor: colors.border }]}
           onPress={() => router.push("/(owner)/analytics/index" as any)}
           activeOpacity={0.8}
         >
            <MaterialCommunityIcons name="lightning-bolt" size={24} color={colors.primary} />
         </TouchableOpacity>
      </BlurView>

      <View style={styles.searchSection}>
        <GlassCard intensity={15} borderRadius={24} style={styles.searchContainer}>
          <Feather name="search" size={20} color={colors.primary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder={language === 'hi' ? "नाम या श्रेणी से खोजें..." : "Search by name or category..."}
            placeholderTextColor={colors.textPlaceholder}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <MaterialCommunityIcons name="close-circle" size={20} color={colors.textPlaceholder} />
            </TouchableOpacity>
          )}
        </GlassCard>
      </View>

      <View style={styles.filterRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item.key}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === f.key ? colors.primary : colors.gray100,
                  borderColor: filter === f.key ? colors.primary : colors.border,
                  ...(filter === f.key ? colors.shadows.soft : {})
                },
              ]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(f.key); }}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons 
                name={f.icon as any} 
                size={18} 
                color={filter === f.key ? "#fff" : colors.textSecondary} 
              />
              <Text
                style={[
                  styles.filterText,
                  { color: filter === f.key ? "#fff" : colors.textPrimary },
                ]}
              >
                {language === 'hi' ? f.labelHindi : f.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50)}>
            <ProductCard
              product={item}
              onPress={() =>
                router.push({
                  pathname: "/(owner)/inventory/edit-product",
                  params: { id: item.id },
                } as any)
              }
              onEdit={() =>
                router.push({
                  pathname: "/(owner)/inventory/edit-product",
                  params: { id: item.id },
                } as any)
              }
              onDelete={() => handleDelete(item)}
              onAdjustStock={() =>
                router.push({
                  pathname: "/(owner)/inventory/edit-product",
                  params: { id: item.id, tab: "stock" },
                } as any)
              }
            />
          </Animated.View>
        )}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 120 },
        ]}
        scrollEnabled={filtered.length > 0}
        ListEmptyComponent={
          <Animated.View entering={FadeInUp}>
            <EmptyState
              icon="cube-outline"
              title={search ? (language === 'hi' ? "आइटम नहीं मिला" : "Item not found") : (language === 'hi' ? "कैटलॉग खाली है" : "Catalog Empty")}
              subtitle={search ? (language === 'hi' ? "आपकी खोज के लिए कोई परिणाम नहीं मिला।" : "We couldn't find matches for your search.") : (language === 'hi' ? "अपना पहला उत्पाद जोड़कर अपनी इन्वेंट्री बनाएं।" : "Build your inventory by adding your first product.")}
              actionLabel={search ? (language === 'hi' ? "खोज साफ करें" : "Clear Search") : (language === 'hi' ? "उत्पाद जोड़ें" : "Add Product")}
              onAction={search ? () => setSearch("") : () => router.push("/(owner)/inventory/add-product" as any)}
            />
          </Animated.View>
        }
      />

      <Animated.View entering={FadeInUp.delay(300)} style={[styles.fabContainer, { bottom: insets.bottom + 90 }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.push("/(owner)/inventory/add-product" as any);
          }}
        >
          <LinearGradient
            colors={["#10B981", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <Feather name="plus" size={32} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <View style={[styles.orb, { backgroundColor: colors.primary + '0A', top: -100, right: -50 }]} />
      <View style={[styles.orb, { backgroundColor: colors.accent + '05', top: 300, left: -100 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
    backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
    shadowColor: '#B46414',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
    zIndex: 10,
  },
  headerInfo: { flex: 1 },
  title: { fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  subtitle: { fontSize: 13, fontWeight: "800", textTransform: 'uppercase', letterSpacing: 0.5 },
  statsBtn: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  searchSection: { paddingHorizontal: 16, marginTop: 12 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '700', height: '100%' },
  filterRow: {
    marginVertical: 16,
  },
  filterList: { paddingHorizontal: 16, gap: 10 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterText: { fontSize: 14, fontWeight: "800" },
  list: { paddingHorizontal: 16, paddingTop: 4, gap: 12 },
  fabContainer: {
    position: "absolute",
    right: 20,
    zIndex: 100,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  orb: { position: 'absolute', width: 350, height: 350, borderRadius: 175, zIndex: -1 },
});
