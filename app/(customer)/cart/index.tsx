import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/utils/formatCurrency";
import { Order } from "@/types/order.types";

export default function CartScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, updateQty, removeItem, clearCart, storeId, storeName, getTotal } = useCartStore();
  const { addOrder } = useData();
  const user = useAuthStore((s) => s.user);
  const [address, setAddress] = useState("123 Main Street, Lajpat Nagar, New Delhi 110024");
  const [placing, setPlacing] = useState(false);

  const subtotal = getTotal();
  const deliveryFee = subtotal >= 500 ? 0 : 30;
  const grandTotal = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      Alert.alert("Address Required", "Please enter a delivery address");
      return;
    }
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 1200));

    const order: Order = {
      id: `order_${Date.now()}`,
      customerId: user?.id ?? "customer_1",
      storeId: storeId ?? "",
      storeName: storeName ?? "Unknown Store",
      orderNumber: `ORD${Date.now().toString().slice(-6)}`,
      status: "PLACED",
      deliveryAddress: address,
      subtotal,
      deliveryFee,
      discount: 0,
      grandTotal,
      paymentMode: "UPI",
      isPaid: true,
      items: items.map((i) => ({
        id: `oi_${i.productId}`,
        productId: i.productId,
        productName: i.name,
        quantity: i.quantity,
        unit: i.unit,
        unitPrice: i.price,
        totalPrice: i.price * i.quantity,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addOrder(order);
    clearCart();
    setPlacing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Order Placed!",
      `Your order #${order.orderNumber} has been placed successfully.`,
      [{ text: "Track Order", onPress: () => router.push("/(customer)/orders/index" as any) }]
    );
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Cart</Text>
        </View>
        <EmptyState
          icon="shopping-cart"
          title="Your cart is empty"
          subtitle="Add items from a nearby store to get started"
          actionLabel="Browse Stores"
          onAction={() => router.push("/(customer)/stores/index" as any)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Cart</Text>
        <TouchableOpacity onPress={() => {
          Alert.alert("Clear Cart", "Remove all items?", [
            { text: "Cancel", style: "cancel" },
            { text: "Clear", style: "destructive", onPress: clearCart },
          ]);
        }}>
          <Feather name="trash-2" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => (
          <View style={[styles.cartItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.itemIcon, { backgroundColor: colors.primaryLight }]}>
              <Feather name="package" size={20} color={colors.primary} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: colors.textPrimary }]}>{item.name}</Text>
              <Text style={[styles.itemPrice, { color: colors.primary }]}>
                {formatCurrency(item.price)}/{item.unit}
              </Text>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={[styles.qtyBtn, { backgroundColor: colors.muted }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateQty(item.productId, item.quantity - 1); }}
              >
                <Feather name="minus" size={14} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.qtyText, { color: colors.textPrimary }]}>{item.quantity}</Text>
              <TouchableOpacity
                style={[styles.qtyBtn, { backgroundColor: colors.muted }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateQty(item.productId, item.quantity + 1); }}
              >
                <Feather name="plus" size={14} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.itemTotal, { color: colors.textPrimary }]}>
              {formatCurrency(item.price * item.quantity)}
            </Text>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={[styles.storeInfo, { backgroundColor: colors.muted }]}>
              <Feather name="home" size={14} color={colors.primary} />
              <Text style={[styles.storeName, { color: colors.textPrimary }]}>{storeName}</Text>
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Delivery Address</Text>
              <TextInput
                style={[styles.addressInput, { borderColor: colors.border, color: colors.textPrimary }]}
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={2}
                placeholder="Enter your delivery address"
                placeholderTextColor={colors.textPlaceholder}
              />
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{formatCurrency(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Delivery Fee</Text>
                <Text style={[styles.summaryValue, { color: deliveryFee === 0 ? colors.success : colors.textPrimary }]}>
                  {deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}
                </Text>
              </View>
              {deliveryFee > 0 && (
                <Text style={[styles.freeDeliveryHint, { color: colors.textSecondary }]}>
                  Add {formatCurrency(500 - subtotal)} more for free delivery
                </Text>
              )}
              <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Grand Total</Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>{formatCurrency(grandTotal)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.placeOrderBtn, { backgroundColor: placing ? colors.muted : colors.primary }]}
              onPress={handlePlaceOrder}
              disabled={placing}
            >
              <Feather name="check-circle" size={20} color="#fff" />
              <Text style={styles.placeOrderText}>
                {placing ? "Placing Order..." : `Place Order — ${formatCurrency(grandTotal)}`}
              </Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontWeight: "800" },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "600" },
  itemPrice: { fontSize: 13, marginTop: 2 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { fontSize: 15, fontWeight: "700", minWidth: 20, textAlign: "center" },
  itemTotal: { fontSize: 14, fontWeight: "700", minWidth: 52, textAlign: "right" },
  footer: { padding: 16, gap: 12 },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    borderRadius: 10,
  },
  storeName: { fontSize: 14, fontWeight: "600" },
  section: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
  sectionTitle: { fontSize: 13, fontWeight: "600", textTransform: "uppercase" },
  addressInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: "600" },
  freeDeliveryHint: { fontSize: 12 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 12,
  },
  totalLabel: { fontSize: 17, fontWeight: "700" },
  totalValue: { fontSize: 22, fontWeight: "800" },
  placeOrderBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 18,
    borderRadius: 16,
  },
  placeOrderText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
