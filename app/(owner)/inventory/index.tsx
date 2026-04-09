import { Feather } from "@expo/vector-icons";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProductCard } from "@/components/owner/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { Product, getStockStatus } from "@/types/inventory.types";

type FilterType = "all" | "low" | "out" | "expiring";

export default function InventoryScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeStore, getProductsForStore, deleteProduct } = useData();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

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

  const filters: Array<{ key: FilterType; label: string }> = [
    { key: "all", label: "All" },
    { key: "low", label: "Low Stock" },
    { key: "out", label: "Out of Stock" },
    { key: "expiring", label: "Expiring" },
  ];

  const handleDelete = (product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    deleteProduct(product.id);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
        },
      ]}
    >
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Inventory</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {allProducts.length} products
        </Text>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search products, SKU..."
          placeholderTextColor={colors.textPlaceholder}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Feather name="x" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f.key ? colors.primary : colors.card,
                borderColor: filter === f.key ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f.key ? "#fff" : colors.textSecondary },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
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
        )}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 100 },
        ]}
        scrollEnabled={filtered.length > 0}
        ListEmptyComponent={
          <EmptyState
            icon="package"
            title={search ? "No products found" : "No products yet"}
            subtitle={search ? "Try a different search term" : "Add your first product to get started"}
            actionLabel={search ? undefined : "Add Product"}
            onAction={search ? undefined : () => router.push("/(owner)/inventory/add-product" as any)}
          />
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 80 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/(owner)/inventory/add-product" as any);
        }}
      >
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 26, fontWeight: "800" },
  subtitle: { fontSize: 13, marginTop: 2 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15 },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: "600" },
  list: { paddingTop: 4 },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
