import { Feather } from "@expo/vector-icons";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { StockBadge } from "@/components/ui/StockBadge";
import { useColors } from "@/hooks/useColors";
import { Product } from "@/types/inventory.types";
import { formatCurrency } from "@/utils/formatCurrency";

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdjustStock?: () => void;
}

export function ProductCard({ product, onPress, onEdit, onDelete, onAdjustStock }: ProductCardProps) {
  const colors = useColors();

  const handleDelete = () => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.main}>
        <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
          <Feather name="package" size={24} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
            {product.name}
          </Text>
          {product.nameHindi && (
            <Text style={[styles.nameHi, { color: colors.textSecondary }]} numberOfLines={1}>
              {product.nameHindi}
            </Text>
          )}
          <Text style={[styles.sku, { color: colors.textSecondary }]}>SKU: {product.sku}</Text>
          <View style={styles.row}>
            <StockBadge product={product} />
            <Text style={[styles.stock, { color: colors.textSecondary }]}>
              {product.currentStock} {product.unit}
            </Text>
          </View>
        </View>
        <View style={styles.right}>
          <Text style={[styles.price, { color: colors.primary }]}>
            {formatCurrency(product.sellingPrice)}
          </Text>
          <Text style={[styles.priceUnit, { color: colors.textSecondary }]}>
            /{product.unit}
          </Text>
        </View>
      </View>
      <View style={[styles.actions, { borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.actionBtn} onPress={onAdjustStock}>
          <Feather name="plus-circle" size={14} color={colors.secondary} />
          <Text style={[styles.actionText, { color: colors.secondary }]}>Adjust</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Feather name="edit-2" size={14} color={colors.mutedForeground} />
          <Text style={[styles.actionText, { color: colors.mutedForeground }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
          <Feather name="trash-2" size={14} color={colors.danger} />
          <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  main: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 15, fontWeight: "600" },
  nameHi: { fontSize: 13 },
  sku: { fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  stock: { fontSize: 12 },
  right: { alignItems: "flex-end" },
  price: { fontSize: 17, fontWeight: "700" },
  priceUnit: { fontSize: 11 },
  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 16,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionText: { fontSize: 13, fontWeight: "500" },
});
