import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuthStore } from "@/store/authStore";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { Order, OrderStatus } from "@/types/order.types";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDateTime } from "@/utils/formatDate";

const STATUS_STEPS: OrderStatus[] = ["PLACED", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED"];

const statusVariant = (s: OrderStatus) => {
  if (s === "DELIVERED") return "success";
  if (s === "CANCELLED") return "danger";
  if (s === "OUT_FOR_DELIVERY") return "primary";
  return "warning";
};

const statusLabel: Record<OrderStatus, string> = {
  PLACED: "Order Placed",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { orders } = useData();

  const myOrders = useMemo(
    () =>
      orders
        .filter((o) => o.customerId === (user?.id ?? ""))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [orders, user?.id]
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) },
      ]}
    >
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>My Orders</Text>
      </View>

      <FlatList
        data={myOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={[styles.orderNum, { color: colors.textPrimary }]}>
                  #{item.orderNumber}
                </Text>
                <Text style={[styles.storeName, { color: colors.textSecondary }]}>
                  {item.storeName}
                </Text>
              </View>
              <Badge label={statusLabel[item.status]} variant={statusVariant(item.status)} />
            </View>

            <View style={styles.timeline}>
              {STATUS_STEPS.map((step, i) => {
                const stepIndex = STATUS_STEPS.indexOf(item.status as OrderStatus);
                const isDone = i <= stepIndex && item.status !== "CANCELLED";
                return (
                  <React.Fragment key={step}>
                    <View style={[styles.dot, { backgroundColor: isDone ? colors.primary : colors.muted }]} />
                    {i < STATUS_STEPS.length - 1 && (
                      <View style={[styles.line, { backgroundColor: isDone && i < stepIndex ? colors.primary : colors.muted }]} />
                    )}
                  </React.Fragment>
                );
              })}
            </View>

            <View style={styles.orderFooter}>
              <Text style={[styles.orderTime, { color: colors.textSecondary }]}>
                {formatDateTime(item.createdAt)}
              </Text>
              <Text style={[styles.orderTotal, { color: colors.primary }]}>
                {formatCurrency(item.grandTotal)}
              </Text>
            </View>

            <Text style={[styles.orderAddress, { color: colors.textSecondary }]} numberOfLines={1}>
              <Feather name="map-pin" size={12} /> {item.deliveryAddress}
            </Text>
          </View>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        ListEmptyComponent={
          <EmptyState
            icon="package"
            title="No orders yet"
            subtitle="Place your first order from a nearby store"
          />
        }
      />
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
  list: { padding: 16, gap: 12 },
  orderCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderNum: { fontSize: 16, fontWeight: "700" },
  storeName: { fontSize: 13, marginTop: 2 },
  timeline: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  line: {
    flex: 1,
    height: 2,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderTime: { fontSize: 12 },
  orderTotal: { fontSize: 16, fontWeight: "800" },
  orderAddress: { fontSize: 12 },
});
