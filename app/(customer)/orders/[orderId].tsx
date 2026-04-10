import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { useData } from "@/context/DataContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/utils/formatCurrency";

const STATUS_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  PENDING: { icon: "clock-outline", color: "#F59E0B", label: "Pending" },
  CONFIRMED: { icon: "check-circle-outline", color: "#6366F1", label: "Confirmed" },
  PREPARING: { icon: "food-outline", color: "#F59E0B", label: "Preparing" },
  OUT_FOR_DELIVERY: { icon: "bike-fast", color: "#3B82F6", label: "Out for Delivery" },
  DELIVERED: { icon: "check-decagram", color: "#10B981", label: "Delivered" },
  CANCELLED: { icon: "close-circle-outline", color: "#EF4444", label: "Cancelled" },
};

export default function OrderDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { orders } = useData();

  const order = useMemo(() => orders.find((o) => o.id === orderId), [orders, orderId]);

  if (!order) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.emptyCenter}>
          <MaterialCommunityIcons name="package-variant-remove" size={64} color={colors.textPlaceholder} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Order Not Found</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>This order may have been removed.</Text>
        </View>
      </View>
    );
  }

  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.success]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Order Details</Text>
          <Text style={styles.headerSub}>#{order.orderNumber || order.id.slice(-6)}</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <GlassCard style={styles.statusCard} intensity={15} borderRadius={28}>
            <View style={[styles.statusIcon, { backgroundColor: statusInfo.color + "20" }]}>
              <MaterialCommunityIcons name={statusInfo.icon as any} size={32} color={statusInfo.color} />
            </View>
            <Text style={[styles.statusLabel, { color: statusInfo.color }]}>{statusInfo.label}</Text>
            <Text style={[styles.orderDate, { color: colors.textSecondary }]}>{orderDate}</Text>
          </GlassCard>
        </Animated.View>

        {/* Items */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <GlassCard style={styles.section} intensity={10} borderRadius={28}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="package-variant" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Items Ordered</Text>
            </View>
            {(order.items || []).map((item: any, idx: number) => (
              <View key={idx} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
                <View style={styles.itemLeft}>
                  <Text style={[styles.itemName, { color: colors.textPrimary }]}>{item.productName || item.name || "Item"}</Text>
                  <Text style={[styles.itemQty, { color: colors.textSecondary }]}>
                    Qty: {item.quantity} × {formatCurrency(item.unitPrice || item.price || 0)}
                  </Text>
                </View>
                <Text style={[styles.itemTotal, { color: colors.textPrimary }]}>
                  {formatCurrency((item.totalPrice || (item.quantity * (item.unitPrice || item.price || 0))) || 0)}
                </Text>
              </View>
            ))}
          </GlassCard>
        </Animated.View>

        {/* Payment Summary */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <GlassCard style={styles.section} intensity={10} borderRadius={28}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="wallet-outline" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Payment Summary</Text>
            </View>
            <View style={styles.payRow}>
              <Text style={[styles.payLabel, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.payValue, { color: colors.textPrimary }]}>{formatCurrency(order.subtotal || 0)}</Text>
            </View>
            <View style={styles.payRow}>
              <Text style={[styles.payLabel, { color: colors.textSecondary }]}>Delivery Fee</Text>
              <Text style={[styles.payValue, { color: colors.textPrimary }]}>{formatCurrency(order.deliveryFee || 0)}</Text>
            </View>
            <View style={[styles.payRow, styles.totalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Grand Total</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>{formatCurrency(order.grandTotal || 0)}</Text>
            </View>
            <View style={[styles.payModeBadge, { backgroundColor: colors.primary + "15" }]}>
              <MaterialCommunityIcons name="credit-card-outline" size={16} color={colors.primary} />
              <Text style={[styles.payModeText, { color: colors.primary }]}>{order.paymentMode || "UPI"}</Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Delivery Address */}
        {order.deliveryAddress ? (
          <Animated.View entering={FadeInDown.delay(400)}>
            <GlassCard style={styles.section} intensity={10} borderRadius={28}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="map-marker-outline" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Delivery Address</Text>
              </View>
              <Text style={[styles.addressText, { color: colors.textSecondary }]}>{order.deliveryAddress}</Text>
            </GlassCard>
          </Animated.View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  headerCenter: { alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  headerSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "700", marginTop: 2 },
  scroll: { padding: 16, gap: 16 },
  emptyCenter: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyTitle: { fontSize: 22, fontWeight: "900" },
  emptySub: { fontSize: 14, fontWeight: "600" },
  statusCard: { alignItems: "center", padding: 28, gap: 10 },
  statusIcon: { width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  statusLabel: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  orderDate: { fontSize: 13, fontWeight: "600" },
  section: { padding: 20, gap: 14 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
  itemRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1 },
  itemLeft: { flex: 1, gap: 4 },
  itemName: { fontSize: 15, fontWeight: "800" },
  itemQty: { fontSize: 13, fontWeight: "600" },
  itemTotal: { fontSize: 16, fontWeight: "900" },
  payRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  payLabel: { fontSize: 14, fontWeight: "700" },
  payValue: { fontSize: 15, fontWeight: "800" },
  totalRow: { borderTopWidth: 1, paddingTop: 12, marginTop: 6 },
  totalLabel: { fontSize: 18, fontWeight: "900" },
  totalValue: { fontSize: 22, fontWeight: "900" },
  payModeBadge: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, marginTop: 4 },
  payModeText: { fontSize: 13, fontWeight: "800", textTransform: "uppercase" },
  addressText: { fontSize: 14, fontWeight: "600", lineHeight: 22 },
});
