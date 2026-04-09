import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { StoreCard } from "@/components/customer/StoreCard";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { PRODUCT_CATEGORIES } from "@/constants/categories";
import { GlassCard } from "@/components/ui/GlassCard";

export default function CustomerHomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { stores } = useData();

  const openStores = useMemo(() => stores.filter((s) => s.isOpen && s.isActive), [stores]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sticky Header */}
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 20 : 10), backgroundColor: colors.white }]}>
        <View style={styles.headerContent}>
          <View style={styles.locationContainer}>
            <View style={[styles.locationIcon, { backgroundColor: colors.primaryLight }]}>
              <Feather name="map-pin" size={14} color={colors.primary} />
            </View>
            <View>
              <View style={styles.deliveryRow}>
                <Text style={[styles.deliveryText, { color: colors.textPrimary }]}>Delivery in 10-15 mins</Text>
                <Feather name="chevron-down" size={12} color={colors.textSecondary} />
              </View>
              <Text style={[styles.cityText, { color: colors.textSecondary }]}>New Delhi, India</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.profileBtn, { backgroundColor: colors.gray100 }]}>
            <Feather name="user" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Professional Search Bar */}
        <TouchableOpacity 
          style={[styles.searchBar, { backgroundColor: colors.gray100 }]}
          activeOpacity={0.9}
        >
          <Feather name="search" size={18} color={colors.primary} />
          <Text style={[styles.searchPlaceholder, { color: colors.textPlaceholder }]}>
            Search "milk", "eggs" or "bread"...
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Promotional Banners */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.bannerRow}
          snapToInterval={width - 40}
          decelerationRate="fast"
        >
          <LinearGradient
            colors={[colors.primary, colors.warning]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            <View style={styles.heroText}>
              <Text style={styles.heroBadge}>WEEKEND SALE</Text>
              <Text style={styles.heroTitle}>Up to 50% Off</Text>
              <Text style={styles.heroSub}>On Household Essentials</Text>
              <TouchableOpacity style={styles.heroBtn}>
                <Text style={[styles.heroBtnText, { color: colors.primary }]}>Shop Now</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.heroOverlay}>
              <Feather name="shopping-cart" size={100} color="rgba(255,255,255,0.15)" />
            </View>
          </LinearGradient>

          <LinearGradient
            colors={[colors.secondary, "#A78BFA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            <View style={styles.heroText}>
              <Text style={styles.heroBadge}>NEW ARRIVALS</Text>
              <Text style={styles.heroTitle}>Fresh Bakery</Text>
              <Text style={styles.heroSub}>Delivered Warm from KiranaAI</Text>
              <TouchableOpacity style={[styles.heroBtn, { backgroundColor: "#fff" }]}>
                <Text style={[styles.heroBtnText, { color: colors.secondary }]}>Explore</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.heroOverlay}>
              <Feather name="coffee" size={100} color="rgba(255,255,255,0.15)" />
            </View>
          </LinearGradient>
        </ScrollView>

        {/* Categories Bento Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Categories</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAll, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.catGrid}>
            {PRODUCT_CATEGORIES.slice(0, 8).map((cat, idx) => (
              <Animated.View key={cat.id} entering={FadeInDown.delay(idx * 50)}>
                <TouchableOpacity
                  style={[styles.catItem]}
                  activeOpacity={0.7}
                >
                  <View style={[styles.catIconContainer, { backgroundColor: colors.gray100 }]}>
                    <MaterialIcons name={cat.icon as any} size={32} color={colors.primary} />
                  </View>
                  <Text style={[styles.catLabel, { color: colors.textPrimary }]} numberOfLines={1}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Flash Deals / Curated Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Stores Near You</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>High rated stores in your locality</Text>
          
          <View style={styles.storeList}>
            {openStores.length === 0 ? (
              <GlassCard intensity={5} style={styles.emptyStores}>
                <Feather name="map-pin" size={32} color={colors.textPlaceholder} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Searching for open stores...
                </Text>
              </GlassCard>
            ) : (
              openStores.map((store, idx) => (
                <Animated.View key={store.id} entering={FadeInUp.delay(idx * 100)}>
                  <StoreCard
                    store={{ ...store, distance: 0.5 + idx * 0.3 }}
                    onPress={() =>
                      router.push({
                        pathname: "/(customer)/stores/[storeId]/index",
                        params: { storeId: store.id },
                      } as any)
                    }
                  />
                </Animated.View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  deliveryText: {
    fontSize: 15,
    fontWeight: "800",
  },
  cityText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 1,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
  },
  searchPlaceholder: {
    fontSize: 15,
    fontWeight: "500",
  },
  scroll: {
    paddingTop: 10,
  },
  bannerRow: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 20,
  },
  heroBanner: {
    width: width - 40,
    borderRadius: 24,
    padding: 24,
    overflow: "hidden",
    position: "relative",
  },
  heroText: {
    zIndex: 2,
    gap: 6,
  },
  heroBadge: {
    fontSize: 10,
    fontWeight: "900",
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
    marginBottom: 10,
  },
  heroBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  heroBtnText: {
    fontSize: 13,
    fontWeight: "800",
  },
  heroOverlay: {
    position: "absolute",
    right: -20,
    bottom: -20,
    zIndex: 1,
  },
  section: {
    paddingTop: 10,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    paddingHorizontal: 20,
    marginTop: -10,
    marginBottom: 16,
    opacity: 0.8,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "700",
  },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
  },
  catItem: {
    width: (width - 62) / 4,
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  catIconContainer: {
    width: 76,
    height: 76,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  catLabel: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  storeList: {
    paddingHorizontal: 0,
  },
  emptyStores: {
    marginHorizontal: 20,
    padding: 40,
    alignItems: "center",
    gap: 12,
    borderRadius: 20,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

import { Dimensions } from "react-native";
