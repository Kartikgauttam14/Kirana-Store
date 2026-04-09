import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { useCartStore } from "@/store/cartStore";
import { PRODUCT_CATEGORIES } from "@/constants/categories";
import { formatCurrency } from "@/utils/formatCurrency";
import { Product } from "@/types/inventory.types";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function StoreDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const { stores, getProductsForStore } = useData();
  const { addItem, items, storeId: cartStoreId, getTotal, clearCart } = useCartStore();

  const store = stores.find((s) => s.id === storeId);
  const products = useMemo(
    () => getProductsForStore(storeId ?? ""),
    [storeId, getProductsForStore]
  );

  const [selectedCategory, setSelectedCategory] = useState("all");
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))];
    return cats;
  }, [products]);

  const filtered = useMemo(() => {
    if (selectedCategory === "all") return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    if (product.currentStock <= 0) {
      Alert.alert("Out of Stock", `${product.name} is currently out of stock`);
      return;
    }
    const result = addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.sellingPrice,
        quantity: 1,
        unit: product.unit,
        gstRate: product.gstRate,
        currentStock: product.currentStock,
      },
      storeId ?? "",
      store?.name ?? ""
    );
    if (result === "store_conflict") {
      Alert.alert(
        "Different Store",
        `Your cart has items from "${useCartStore.getState().storeName}". Clear cart to order from ${store?.name}?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Clear & Continue", style: "destructive", onPress: () => {
            clearCart();
            addItem(
              {
                productId: product.id,
                name: product.name,
                price: product.sellingPrice,
                quantity: 1,
                unit: product.unit,
                gstRate: product.gstRate,
                currentStock: product.currentStock,
              },
              storeId ?? "",
              store?.name ?? ""
            );
          }},
        ]
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getCartQty = (productId: string) =>
    items.find((i) => i.productId === productId)?.quantity ?? 0;

  if (!store) {
    return (
      <EmptyState icon="home" title="Store not found" />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.heroSection,
          {
            backgroundColor: colors.primaryLight,
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
          },
        ]}
      >
        <View style={styles.heroTop}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.card }]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={[styles.storeLogo, { backgroundColor: colors.primary }]}>
            <BrandLogo size={40} />
          </View>
        </View>
        <Text style={[styles.storeName, { color: colors.textPrimary }]}>{store.name}</Text>
        <Text style={[styles.storeAddr, { color: colors.textSecondary }]}>{store.address}</Text>
        <View style={styles.storeMeta}>
          <Badge label={store.isOpen ? "Open" : "Closed"} variant={store.isOpen ? "success" : "danger"} />
          <View style={styles.metaItem}>
            <Feather name="star" size={12} color="#FBBC04" />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{store.rating.toFixed(1)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="clock" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {store.openTime} - {store.closeTime}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catRow}>
        <TouchableOpacity
          style={[styles.catChip, { backgroundColor: selectedCategory === "all" ? colors.primary : colors.card, borderColor: selectedCategory === "all" ? colors.primary : colors.border }]}
          onPress={() => setSelectedCategory("all")}
        >
          <Text style={[styles.catText, { color: selectedCategory === "all" ? "#fff" : colors.textSecondary }]}>All</Text>
        </TouchableOpacity>
        {categories.map((cat) => {
          const catInfo = PRODUCT_CATEGORIES.find((c) => c.id === cat);
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, { backgroundColor: selectedCategory === cat ? colors.primary : colors.card, borderColor: selectedCategory === cat ? colors.primary : colors.border }]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.catText, { color: selectedCategory === cat ? "#fff" : colors.textSecondary }]}>
                {catInfo?.label ?? cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        renderItem={({ item }) => {
          const qty = getCartQty(item.id);
          return (
            <View
              style={[
                styles.productCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={[styles.productIcon, { backgroundColor: colors.primaryLight }]}>
                <Feather name="package" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={[styles.productUnit, { color: colors.textSecondary }]}>
                per {item.unit}
              </Text>
              <Text style={[styles.productPrice, { color: colors.primary }]}>
                {formatCurrency(item.sellingPrice)}
              </Text>
              {item.currentStock <= 0 ? (
                <View style={[styles.outOfStockBadge, { backgroundColor: colors.dangerLight }]}>
                  <Text style={[styles.outOfStockText, { color: colors.danger }]}>Out of Stock</Text>
                </View>
              ) : qty > 0 ? (
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
                    onPress={() => useCartStore.getState().updateQty(item.id, qty - 1)}
                  >
                    <Feather name="minus" size={14} color="#fff" />
                  </TouchableOpacity>
                  <Text style={[styles.qtyText, { color: colors.textPrimary }]}>{qty}</Text>
                  <TouchableOpacity
                    style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
                    onPress={() => handleAddToCart(item)}
                  >
                    <Feather name="plus" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.addBtn, { backgroundColor: colors.primary }]}
                  onPress={() => handleAddToCart(item)}
                >
                  <Feather name="plus" size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        contentContainerStyle={[styles.productList, { paddingBottom: insets.bottom + 120 }]}
        ListEmptyComponent={<EmptyState icon="package" title="No products" subtitle="This store has no products in this category" />}
      />

      {cartCount > 0 && (
        <TouchableOpacity
          style={[
            styles.cartBar,
            {
              backgroundColor: colors.primary,
              bottom: insets.bottom + (Platform.OS === "web" ? 84 + 34 : 84),
            },
          ]}
          onPress={() => router.push("/(customer)/cart/index" as any)}
        >
          <View style={[styles.cartBadge, { backgroundColor: "#fff" }]}>
            <Text style={[styles.cartBadgeText, { color: colors.primary }]}>{cartCount}</Text>
          </View>
          <Text style={styles.cartBarText}>View Cart</Text>
          <Text style={styles.cartBarTotal}>{formatCurrency(getTotal())}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroSection: { padding: 16, gap: 6 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  storeLogo: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  storeName: { fontSize: 22, fontWeight: "800" },
  storeAddr: { fontSize: 13 },
  storeMeta: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 4, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { fontSize: 12 },
  catScroll: { paddingVertical: 10 },
  catRow: { paddingHorizontal: 14, gap: 8 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  catText: { fontSize: 13, fontWeight: "600" },
  productRow: { justifyContent: "space-between", paddingHorizontal: 14, marginBottom: 10 },
  productList: { paddingTop: 4 },
  productCard: {
    width: "48%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  productIcon: {
    width: "100%",
    aspectRatio: 1.5,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  productName: { fontSize: 14, fontWeight: "600" },
  productUnit: { fontSize: 12 },
  productPrice: { fontSize: 16, fontWeight: "800" },
  outOfStockBadge: { padding: 6, borderRadius: 8, alignItems: "center" },
  outOfStockText: { fontSize: 12, fontWeight: "600" },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { fontSize: 15, fontWeight: "700", flex: 1, textAlign: "center" },
  cartBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: { fontWeight: "800", fontSize: 14 },
  cartBarText: { flex: 1, color: "#fff", fontWeight: "700", fontSize: 15 },
  cartBarTotal: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
