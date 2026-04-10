import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuthStore } from "@/store/authStore";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { Order, OrderStatus } from "@/types/order.types";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDateTime } from "@/utils/formatDate";
import { GlassCard } from "@/components/ui/GlassCard";
import { useRealtimeCustomerOrders } from "@/hooks/useRealtimeOrders";

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
  OUT_FOR_DELIVERY: "On the way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function OrdersScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { orders } = useData();

  // Subscribe to live order status changes from Supabase Realtime
  useRealtimeCustomerOrders(user?.id);

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
    <View style={[styles.container, { backgroundColor: colors.gray100 }]}>
      <StatusBar barStyle="dark-content" />
      <BlurView
        intensity={60}
        tint="light"
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 30 : 0) }]}
      >
         <View>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Purchase History</Text>
            <Text style={[styles.title, { color: colors.textPrimary }]}>My Orders</Text>
         </View>
         <TouchableOpacity style={[styles.refreshBtn, { backgroundColor: colors.primary + '10' }]}>
            <Feather name="refresh-cw" size={20} color={colors.primary} />
         </TouchableOpacity>
      </BlurView>

      <FlatList
        data={myOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(100 + index * 50)}>
            <GlassCard intensity={15} borderRadius={28} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderIdentity}>
                   <View style={[styles.orderIcon, { backgroundColor: colors.primary + '10' }]}>
                      <MaterialCommunityIcons name="shopping-outline" size={24} color={colors.primary} />
                   </View>
                   <View>
                     <Text style={[styles.orderNum, { color: colors.textPrimary }]}>Order #{item.orderNumber}</Text>
                     <Text style={[styles.storeName, { color: colors.textSecondary }]}>{item.storeName}</Text>
                   </View>
                </View>
                <Badge label={statusLabel[item.status]} variant={statusVariant(item.status)} />
              </View>

              <View style={styles.timelineWrapper}>
                 <View style={styles.timelineContainer}>
                    {STATUS_STEPS.map((step, i) => {
                      const stepIndex = STATUS_STEPS.indexOf(item.status as OrderStatus);
                      const isPast = i < stepIndex;
                      const isCurrent = i === stepIndex;
                      const isFuture = i > stepIndex;
                      const isCancelled = item.status === "CANCELLED";
                      
                      return (
                        <View key={step} style={styles.timelineStep}>
                           <View style={styles.dotLineRow}>
                              <View style={[
                                styles.stepDot, 
                                { 
                                  backgroundColor: isCancelled ? colors.danger : (isPast || isCurrent ? colors.primary : colors.gray300),
                                  shadowColor: isCurrent ? colors.primary : 'transparent',
                                  ... (isCurrent ? { elevation: 4, shadowOpacity: 0.5, shadowRadius: 5 } : {})
                                }
                              ]}>
                                 {(isPast || isCurrent) && <Feather name="check" size={8} color="#fff" />}
                              </View>
                              {i < STATUS_STEPS.length - 1 && (
                                <View style={[
                                  styles.stepLine, 
                                  { backgroundColor: isCancelled ? colors.danger + '40' : (isPast ? colors.primary : colors.gray100) }
                                ]} />
                              )}
                           </View>
                        </View>
                      );
                    })}
                 </View>
                 <View style={styles.timelineLabels}>
                    <Text style={[styles.timelineLabel, { color: colors.textSecondary }]}>Placed</Text>
                    <Text style={[styles.timelineLabel, { color: colors.textSecondary, textAlign: 'center' }]}>Processing</Text>
                    <Text style={[styles.timelineLabel, { color: colors.textSecondary, textAlign: 'right' }]}>Delivered</Text>
                 </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border + '40' }]} />

              <View style={styles.orderFooter}>
                <View style={styles.orderDetails}>
                   <View style={styles.footerItem}>
                      <Feather name="calendar" size={12} color={colors.textSecondary} />
                      <Text style={[styles.orderTime, { color: colors.textSecondary }]}>{formatDateTime(item.createdAt)}</Text>
                   </View>
                   <View style={styles.footerItem}>
                      <Feather name="map-pin" size={12} color={colors.textSecondary} />
                      <Text style={[styles.orderAddress, { color: colors.textSecondary }]} numberOfLines={1}>
                        {item.deliveryAddress}
                      </Text>
                   </View>
                </View>
                <Text style={[styles.orderTotal, { color: colors.textPrimary }]}>{formatCurrency(item.grandTotal)}</Text>
              </View>
            </GlassCard>
          </Animated.View>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 120 }]}
        ListEmptyComponent={
          <EmptyState
            icon="package"
            title="No orders yet"
            subtitle="Your purchase history will appear here once you place an order."
            actionLabel="Start Shopping"
            onAction={() => router.push("/(customer)/home" as any)}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 4,
    shadowColor: '#B46414',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    zIndex: 10,
  },
  subtitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { fontSize: 26, fontWeight: "900", letterSpacing: -0.5 },
  refreshBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingTop: 20, gap: 16 },
  orderCard: {
    padding: 20,
    gap: 16,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderIdentity: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  orderIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  orderNum: { fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
  storeName: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  timelineWrapper: { marginTop: 8, paddingHorizontal: 4 },
  timelineContainer: { flexDirection: 'row', alignItems: 'center' },
  timelineStep: { flex: 1 },
  dotLineRow: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepLine: {
    flex: 1,
    height: 3,
    marginHorizontal: -2,
    zIndex: 1,
  },
  timelineLabels: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     marginTop: 10,
  },
  timelineLabel: { fontSize: 10, fontWeight: '800', width: 60, textTransform: 'uppercase' },
  divider: { height: 1.5, width: '100%' },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  orderDetails: { flex: 1, gap: 6 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderTime: { fontSize: 12, fontWeight: '600' },
  orderTotal: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  orderAddress: { fontSize: 12, fontWeight: '600', maxWidth: '85%' },
});
