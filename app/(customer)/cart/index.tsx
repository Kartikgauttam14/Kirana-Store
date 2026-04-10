import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
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
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { BlurView } from "expo-blur";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/utils/formatCurrency";
import { Order } from "@/types/order.types";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

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
    router.replace({ pathname: "/(customer)/orders/index", params: { orderId: order.id } } as any);
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" />
        <BlurView 
           intensity={70} 
           tint="light" 
           style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 30 : 0) }]}
        >
           <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="chevron-left" size={24} color={colors.textPrimary} />
           </TouchableOpacity>
           <Text style={[styles.title, { color: colors.textPrimary }]}>Order Cart</Text>
           <View style={{ width: 44 }} />
        </BlurView>
        <EmptyState
          icon="shopping-cart"
          title="Your cart is lonely"
          subtitle="Add items from a nearby store to fill it up."
          actionLabel="Browse Local Stores"
          onAction={() => router.push("/(customer)/home" as any)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.gray100 }]}>
      <StatusBar barStyle="dark-content" />
      <BlurView 
        intensity={70} 
        tint="light" 
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 30 : 0) }]}
      >
         <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color={colors.textPrimary} />
         </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Order Cart</Text>
        <TouchableOpacity 
          style={styles.clearBtn}
          onPress={() => {
            Alert.alert("Empty Cart?", "This will remove all items from your bag.", [
              { text: "No", style: "cancel" },
              { text: "Yes, Empty It", style: "destructive", onPress: clearCart },
            ]);
          }}
        >
          <Feather name="trash-2" size={20} color={colors.danger} />
        </TouchableOpacity>
      </BlurView>

      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(100 + index * 50)}>
            <GlassCard intensity={15} borderRadius={24} style={styles.cartItemCard}>
              <View style={[styles.itemIcon, { backgroundColor: colors.primary + "10" }]}>
                <MaterialCommunityIcons name="package-variant-closed" size={24} color={colors.primary} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.textPrimary }]}>{item.name}</Text>
                <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>
                  {formatCurrency(item.price)} per {item.unit}
                </Text>
              </View>
              <View style={styles.qtyControl}>
                <TouchableOpacity
                  style={[styles.qtyBtn, { backgroundColor: colors.gray100 }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateQty(item.productId, item.quantity - 1); }}
                >
                  <Feather name="minus" size={14} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.qtyText, { color: colors.textPrimary }]}>{item.quantity}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, { backgroundColor: colors.gray100 }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateQty(item.productId, item.quantity + 1); }}
                >
                  <Feather name="plus" size={14} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.itemTotal, { color: colors.textPrimary }]}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </GlassCard>
          </Animated.View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <LinearGradient
               colors={[colors.primary + "15", "transparent"]}
               style={styles.storeBanner}
               start={{ x:0, y:0 }}
               end={{ x:1, y:1 }}
            >
              <MaterialCommunityIcons name="storefront" size={20} color={colors.primary} />
              <Text style={[styles.storeNameText, { color: colors.primary }]}>Ordering from {storeName}</Text>
            </LinearGradient>

            <GlassCard style={styles.section} intensity={10} borderRadius={24}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Delivery Address</Text>
              <View style={styles.addressWrapper}>
                <Feather name="map-pin" size={16} color={colors.primary} style={styles.addrIcon} />
                <TextInput
                  style={[styles.addressInput, { color: colors.textPrimary }]}
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  placeholder="Where should we deliver?"
                  placeholderTextColor={colors.textPlaceholder}
                />
              </View>
            </GlassCard>

            <GlassCard style={styles.section} intensity={20} borderRadius={24}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{formatCurrency(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Delivery Fee</Text>
                <Text style={[styles.summaryValue, { color: deliveryFee === 0 ? colors.success : colors.textPrimary, fontWeight: '800' }]}>
                  {deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}
                </Text>
              </View>
              {deliveryFee > 0 && (
                <View style={[styles.deliveryProgress, { backgroundColor: colors.success + "10" }]}>
                  <Text style={[styles.freeDeliveryHint, { color: colors.success }]}>
                    Add {formatCurrency(500 - subtotal)} more for <Text style={{fontWeight:'900'}}>FREE</Text> delivery
                  </Text>
                </View>
              )}
              <View style={[styles.totalRow, { borderTopColor: colors.border + "40" }]}>
                <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Grand Total</Text>
                <AnimatedCounter value={grandTotal} prefix="₹" style={[styles.totalValue, { color: colors.textPrimary }]} />
              </View>
            </GlassCard>

            <TouchableOpacity
              style={styles.orderBtnWrapper}
              onPress={handlePlaceOrder}
              disabled={placing}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[colors.primary, colors.success]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.placeOrderBtn}
              >
                {placing ? (
                  <Text style={styles.placeOrderText}>Finalizing Your Bag...</Text>
                ) : (
                  <>
                    <Text style={styles.placeOrderText}>
                      Secure Checkout — {formatCurrency(grandTotal)}
                    </Text>
                    <Feather name="lock" size={18} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
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
    paddingVertical: 20,
    backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#B46414',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    zIndex: 10,
  },
  title: { fontSize: 24, fontWeight: "900" },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  clearBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  cartItemCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
  },
  itemIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: { flex: 1, gap: 4 },
  itemName: { fontSize: 16, fontWeight: "800" },
  itemPrice: { fontSize: 13, fontWeight: '600' },
  qtyControl: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 4,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { fontSize: 16, fontWeight: "900", minWidth: 24, textAlign: "center" },
  itemTotal: { fontSize: 16, fontWeight: "900", minWidth: 65, textAlign: "right" },
  footer: { padding: 16, gap: 16 },
  storeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 16,
    marginTop: 8,
  },
  storeNameText: { fontSize: 14, fontWeight: "800" },
  section: { padding: 20, gap: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  addressWrapper: {
     flexDirection: 'row',
     alignItems: 'flex-start',
     gap: 12,
     backgroundColor: 'rgba(0,0,0,0.03)',
     padding: 14,
     borderRadius: 16,
  },
  addrIcon: { marginTop: 2 },
  addressInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    maxHeight: 80,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: 15, fontWeight: '600' },
  summaryValue: { fontSize: 15, fontWeight: "800" },
  deliveryProgress: { padding: 12, borderRadius: 12, alignItems: 'center' },
  freeDeliveryHint: { fontSize: 13, fontWeight: '700' },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 4,
  },
  totalLabel: { fontSize: 20, fontWeight: "900" },
  totalValue: { fontSize: 28, fontWeight: "900" },
  orderBtnWrapper: {
     marginTop: 8,
     borderRadius: 24,
     overflow: 'hidden',
     elevation: 8,
     shadowColor: '#10B981',
     shadowOffset: { width: 0, height: 10 },
     shadowOpacity: 0.3,
     shadowRadius: 15,
  },
  placeOrderBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 22,
  },
  placeOrderText: { color: "#fff", fontSize: 18, fontWeight: "900", letterSpacing: -0.5 },
});
