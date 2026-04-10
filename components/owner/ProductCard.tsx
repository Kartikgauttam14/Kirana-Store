import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { StockBadge } from "@/components/ui/StockBadge";
import { useColors } from "@/hooks/useColors";
import { Product } from "@/types/inventory.types";
import { formatCurrency } from "@/utils/formatCurrency";
import { GlassCard } from "@/components/ui/GlassCard";

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
      "Remove Item?",
      `This will delete "${product.name}" from your catalog permanently.`,
      [
        { text: "No, Keep It", style: "cancel" },
        { text: "Yes, Delete", style: "destructive", onPress: onDelete },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <GlassCard intensity={15} borderRadius={24} style={styles.card}>
        <TouchableOpacity style={styles.main} onPress={onPress} activeOpacity={0.7}>
          <LinearGradient
             colors={[colors.primary + '20', 'transparent']}
             style={styles.iconBox}
          >
            <MaterialCommunityIcons name="package-variant-closed" size={24} color={colors.primary} />
          </LinearGradient>

          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
              {product.name}
            </Text>
            {product.nameHindi && (
              <Text style={[styles.nameHi, { color: colors.textSecondary }]} numberOfLines={1}>
                {product.nameHindi}
              </Text>
            )}
            <View style={styles.skuRow}>
               <Feather name="box" size={10} color={colors.textPlaceholder} />
               <Text style={[styles.sku, { color: colors.textSecondary }]}>SKU: {product.sku}</Text>
            </View>
            <View style={styles.stockRow}>
              <StockBadge product={product} />
              <Text style={[styles.stockValue, { color: colors.textPrimary }]}>
                {product.currentStock} <Text style={{ fontSize: 10, color: colors.textSecondary }}>{product.unit}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.right}>
            <Text style={[styles.price, { color: colors.textPrimary }]}>
              {formatCurrency(product.sellingPrice)}
            </Text>
            <Text style={[styles.priceUnit, { color: colors.textSecondary }]}>
              per {product.unit}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.actions, { borderTopColor: colors.border + '30' }]}>
          <TouchableOpacity style={styles.actionBtn} onPress={onAdjustStock}>
            <View style={[styles.actionIcon, { backgroundColor: colors.primary + '10' }]}>
               <Feather name="refresh-cw" size={14} color={colors.primary} />
            </View>
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>Stock</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
            <View style={[styles.actionIcon, { backgroundColor: colors.gray100 }]}>
               <Feather name="edit-3" size={14} color={colors.textSecondary} />
            </View>
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
            <View style={[styles.actionIcon, { backgroundColor: colors.danger + '10' }]}>
               <Feather name="trash-2" size={14} color={colors.danger} />
            </View>
            <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginBottom: 12 },
  card: { overflow: 'hidden' },
  main: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 14,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  info: { flex: 1, gap: 4 },
  name: { fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
  nameHi: { fontSize: 14, fontWeight: '600' },
  skuRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sku: { fontSize: 11, fontWeight: '600' },
  stockRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  stockValue: { fontSize: 13, fontWeight: "800" },
  right: { alignItems: "flex-end", gap: 2 },
  price: { fontSize: 18, fontWeight: "900", letterSpacing: -0.5 },
  priceUnit: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  actions: {
    flexDirection: "row",
    borderTopWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 18,
    justifyContent: 'space-between',
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 10 },
  actionIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 13, fontWeight: "800" },
});
