import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { useData } from "@/context/DataContext";
import { useAuthStore } from "@/store/authStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/utils/formatCurrency";

export default function SearchScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { query: initialQuery } = useLocalSearchParams<{ query: string }>();
  const language = useAuthStore((s) => s.language);
  const { products, stores } = useData();

  const [search, setSearch] = useState(initialQuery || "");
  const [activeTab, setActiveTab] = useState<"products" | "stores">("products");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (initialQuery) {
      setSearch(initialQuery);
    }
    // Optional focus: setTimeout(() => inputRef.current?.focus(), 500);
  }, [initialQuery]);

  const filteredProducts = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return products.filter((p) => 
      p.name.toLowerCase().includes(q) || 
      p.category?.toLowerCase().includes(q)
    );
  }, [search, products]);

  const filteredStores = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return stores.filter((s) => 
      s.isActive && (s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q))
    );
  }, [search, stores]);

  const suggestions = ["Milk", "Bread", "Eggs", "Atta", "Rice", "Dal", "Snacks", "Beverages"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.success]}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 12 : 8) }]}
      >
        <View style={styles.searchRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.searchInputWrapper}>
            <Feather name="search" size={20} color={colors.primary} />
            <TextInput
              ref={inputRef}
              style={[styles.searchInput, { color: colors.primary }]}
              value={search}
              onChangeText={setSearch}
              placeholder={language === 'hi' ? "खोजें..." : "Search products, categories..."}
              placeholderTextColor={colors.primary + "80"}
              autoFocus={!initialQuery}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")} style={styles.clearBtn}>
                <Feather name="x" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs */}
        {search.length > 0 && (
          <View style={styles.tabsRow}>
             <TouchableOpacity 
               style={[styles.tabBtn, activeTab === "products" && styles.tabBtnActive]}
               onPress={() => setActiveTab("products")}
             >
               <Text style={[styles.tabText, activeTab === "products" && styles.tabTextActive]}>
                 {language === 'hi' ? "उत्पाद" : "Products"} ({filteredProducts.length})
               </Text>
             </TouchableOpacity>
             <TouchableOpacity 
               style={[styles.tabBtn, activeTab === "stores" && styles.tabBtnActive]}
               onPress={() => setActiveTab("stores")}
             >
               <Text style={[styles.tabText, activeTab === "stores" && styles.tabTextActive]}>
                 {language === 'hi' ? "दुकानें" : "Stores"} ({filteredStores.length})
               </Text>
             </TouchableOpacity>
          </View>
        )}
      </LinearGradient>

      {search.length === 0 ? (
        <Animated.View entering={FadeInDown} style={styles.suggestionsContainer}>
          <Text style={[styles.suggestionsTitle, { color: colors.textPrimary }]}>
            {language === 'hi' ? "लोकप्रिय खोजें" : "Popular Searches"}
          </Text>
          <View style={styles.suggestionsGrid}>
            {suggestions.map((s, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[styles.suggestionItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setSearch(s)}
              >
                <Feather name="search" size={14} color={colors.textSecondary} />
                <Text style={[styles.suggestionText, { color: colors.textPrimary }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      ) : activeTab === "products" ? (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInUp.delay(index * 50)}>
              <GlassCard intensity={8} borderRadius={20} style={styles.resultCard}>
                <View style={[styles.iconBox, { backgroundColor: colors.primary + "15" }]}>
                  <MaterialCommunityIcons name="package-variant" size={24} color={colors.primary} />
                </View>
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultName, { color: colors.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.resultSub, { color: colors.textSecondary }]}>
                    {item.category || "General"} • {formatCurrency(item.sellingPrice)}
                  </Text>
                </View>
                <TouchableOpacity 
                   style={[styles.visitBtn, { backgroundColor: colors.primary }]}
                   onPress={() => router.push({ pathname: "/(customer)/stores/[storeId]/index", params: { storeId: item.storeId } } as any)}
                >
                   <Text style={styles.visitText}>{language === 'hi' ? "स्टोर" : "Store"}</Text>
                </TouchableOpacity>
              </GlassCard>
            </Animated.View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="search" size={48} color={colors.textPlaceholder} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                 {language === 'hi' ? "कोई उत्पाद नहीं मिला" : "No products found"}
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredStores}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInUp.delay(index * 50)}>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: "/(customer)/stores/[storeId]/index", params: { storeId: item.id } } as any)}
              >
                <GlassCard intensity={8} borderRadius={20} style={styles.resultCard}>
                  <View style={[styles.iconBox, { backgroundColor: colors.secondary + "15" }]}>
                    <MaterialCommunityIcons name="storefront-outline" size={24} color={colors.secondary} />
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={[styles.resultName, { color: colors.textPrimary }]}>{item.name}</Text>
                    <Text style={[styles.resultSub, { color: colors.textSecondary }]}>{item.city} • ★ {item.rating.toFixed(1)}</Text>
                  </View>
                  <Feather name="arrow-right" size={20} color={colors.textPlaceholder} />
                </GlassCard>
              </TouchableOpacity>
            </Animated.View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="store-remove-outline" size={48} color={colors.textPlaceholder} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                 {language === 'hi' ? "कोई दुकान नहीं मिली" : "No stores found"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  searchInputWrapper: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, paddingHorizontal: 14, height: 46, gap: 10 },
  searchInput: { flex: 1, fontSize: 16, fontWeight: "700" },
  clearBtn: { backgroundColor: "#94A3B8", borderRadius: 12, padding: 2 },
  tabsRow: { flexDirection: "row", marginTop: 16, gap: 12 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)" },
  tabBtnActive: { backgroundColor: "#fff" },
  tabText: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "700" },
  tabTextActive: { color: "#10B981", fontWeight: "900" },
  suggestionsContainer: { padding: 24 },
  suggestionsTitle: { fontSize: 18, fontWeight: "900", marginBottom: 16 },
  suggestionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  suggestionItem: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, borderWidth: 1 },
  suggestionText: { fontSize: 14, fontWeight: "600" },
  listContainer: { padding: 16, gap: 12 },
  resultCard: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  resultInfo: { flex: 1, gap: 4 },
  resultName: { fontSize: 16, fontWeight: "800" },
  resultSub: { fontSize: 13, fontWeight: "600" },
  visitBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  visitText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 16, fontWeight: "600" },
});
