import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";

import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { CartItem, Bill, PaymentMode } from "@/types/billing.types";
import { formatCurrency } from "@/utils/formatCurrency";
import { calculateGST } from "@/utils/gstCalculator";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { StoreHeader } from "@/components/owner/StoreHeader";

export default function BillingScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeStore, getProductsForStore, addBill, updateProduct } = useData();

  const products = useMemo(
    () => getProductsForStore(activeStore?.id ?? ""),
    [activeStore?.id, getProductsForStore]
  );

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("CASH");
  const [discount, setDiscount] = useState("");
  const [qtyModal, setQtyModal] = useState<{ product: typeof products[0] } | null>(null);
  const [qtyInput, setQtyInput] = useState("1");
  const [loading, setLoading] = useState(false);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [search, products]);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const gstTotal = cart.reduce((s, i) => {
    const gst = calculateGST(i.price * i.quantity, i.gstRate);
    return s + gst.totalGST;
  }, 0);
  const discountAmt = parseFloat(discount) || 0;
  const grandTotal = Math.max(0, subtotal - discountAmt);

  const addToCart = (product: typeof products[0], qty: number) => {
    if (product.currentStock <= 0) {
      Alert.alert(
        "Zero Stock",
        `${product.name} has 0 stock. Add anyway?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Add Anyway", onPress: () => doAddToCart(product, qty) },
        ]
      );
      return;
    }
    doAddToCart(product, qty);
  };

  const doAddToCart = (product: typeof products[0], qty: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.sellingPrice,
          quantity: qty,
          unit: product.unit,
          gstRate: product.gstRate,
          currentStock: product.currentStock,
        },
      ];
    });
    setSearch("");
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
      );
    }
  };

  const generateBill = async () => {
    if (cart.length === 0) {
      Alert.alert("Empty Cart", "Add at least one product to create a bill");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const billNumber = `KA${Date.now().toString().slice(-6)}`;
    const bill: Bill = {
      id: `bill_${Date.now()}`,
      storeId: activeStore?.id ?? "",
      billNumber,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      subtotal,
      gstTotal,
      discount: discountAmt,
      grandTotal,
      paymentMode,
      isPaid: paymentMode !== "CREDIT",
      items: cart.map((i) => {
        const gst = calculateGST(i.price * i.quantity, i.gstRate);
        return {
          id: `bi_${Date.now()}_${i.productId}`,
          productId: i.productId,
          productName: i.name,
          quantity: i.quantity,
          unit: i.unit,
          unitPrice: i.price,
          gstRate: i.gstRate,
          gstAmount: gst.totalGST,
          totalPrice: i.price * i.quantity,
        };
      }),
      createdAt: new Date().toISOString(),
    };

    cart.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        updateProduct(item.productId, {
          currentStock: Math.max(0, product.currentStock - item.quantity),
          updatedAt: new Date().toISOString(),
        });
      }
    });

    addBill(bill);
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setDiscount("");
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push({ pathname: "/(owner)/billing/history", params: { billId: bill.id } } as any);
  };

  const payModes: Array<{ mode: PaymentMode; icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }> = [
    { mode: "CASH", icon: "cash", label: "Cash" },
    { mode: "UPI", icon: "qrcode-scan", label: "UPI" },
    { mode: "CARD", icon: "credit-card-outline", label: "Card" },
    { mode: "CREDIT", icon: "clock-outline", label: "Credit" },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StoreHeader />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120, paddingTop: 10 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(50)}>
          <GlassCard style={styles.section} intensity={15} borderRadius={32}>
            <View style={styles.sectionHeader}>
               <MaterialCommunityIcons name="account-circle-outline" size={20} color={colors.primary} />
               <Text style={[styles.sectionTitle, { color: colors.primary }]}>Customer Detail</Text>
            </View>
            <View style={styles.customerRow}>
              <View style={[styles.inputBox, { backgroundColor: colors.gray100, borderColor: colors.border, flex: 1.5 }]}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Full Name"
                  placeholderTextColor={colors.textPlaceholder}
                  value={customerName}
                  onChangeText={setCustomerName}
                />
              </View>
              <View style={[styles.inputBox, { backgroundColor: colors.gray100, borderColor: colors.border, flex: 1 }]}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Mobile"
                  placeholderTextColor={colors.textPlaceholder}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                />
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100)}>
          <GlassCard style={styles.section} intensity={20} borderRadius={32}>
            <View style={styles.sectionHeader}>
               <MaterialCommunityIcons name="barcode-scan" size={20} color={colors.primary} />
               <Text style={[styles.sectionTitle, { color: colors.primary }]}>Add Product</Text>
            </View>
            <View style={[styles.searchRow, { backgroundColor: colors.glassSurface, borderColor: colors.border, ...colors.shadows.soft }]}>
              <Feather name="search" size={20} color={colors.primary} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Scan or search..."
                placeholderTextColor={colors.textPlaceholder}
                value={search}
                onChangeText={setSearch}
              />
            </View>
            {searchResults.length > 0 && (
              <Animated.View entering={ZoomIn} style={styles.resultsWrapper}>
                {searchResults.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.searchResult, { borderBottomColor: colors.border + "40" }]}
                    onPress={() => {
                      setQtyModal({ product: p });
                      setQtyInput("1");
                      Haptics.selectionAsync();
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.resultLeft}>
                      <View style={[styles.resultIconBox, { backgroundColor: colors.primary + '10' }]}>
                         <MaterialCommunityIcons name="cube-outline" size={20} color={colors.primary} />
                      </View>
                      <View>
                        <Text style={[styles.resultName, { color: colors.textPrimary }]}>{p.name}</Text>
                        <Text style={[styles.resultStock, { color: p.currentStock > 5 ? colors.success : colors.danger }]}>
                          {p.currentStock > 0 ? `${p.currentStock} left` : "Out of Stock"}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.resultPrice, { color: colors.textPrimary }]}>
                      {formatCurrency(p.sellingPrice)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}
          </GlassCard>
        </Animated.View>

        {cart.length > 0 && (
          <Animated.View entering={FadeInDown.delay(150)}>
            <GlassCard style={styles.section} intensity={30} borderRadius={32}>
              <View style={styles.cartHeader}>
                 <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name="cart-outline" size={20} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>Current Bill</Text>
                 </View>
                 <TouchableOpacity onPress={() => setCart([])} style={styles.clearBtn}>
                    <MaterialCommunityIcons name="trash-can-outline" size={16} color={colors.danger} />
                    <Text style={{ color: colors.danger, fontWeight: '800', fontSize: 13 }}>Flush</Text>
                 </TouchableOpacity>
              </View>
              
              {cart.map((item) => (
                <View key={item.productId} style={[styles.cartItem, { borderBottomColor: colors.border + "60" }]}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.cartName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.cartRate, { color: colors.textPlaceholder }]}>
                      {formatCurrency(item.price)} × {item.quantity}
                    </Text>
                  </View>
                  <View style={styles.qtyControl}>
                    <TouchableOpacity
                      style={[styles.qtyBtn, { backgroundColor: colors.gray100 }]}
                      onPress={() => updateCartQty(item.productId, item.quantity - 1)}
                    >
                      <Feather name="minus" size={16} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.qtyText, { color: colors.textPrimary }]}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={[styles.qtyBtn, { backgroundColor: colors.primary + '20' }]}
                      onPress={() => updateCartQty(item.productId, item.quantity + 1)}
                    >
                      <Feather name="plus" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.cartTotal, { color: colors.textPrimary }]}>
                    {formatCurrency(item.price * item.quantity)}
                  </Text>
                </View>
              ))}

              <View style={styles.summaryBox}>
                 <Row label="Subtotal" value={formatCurrency(subtotal)} colors={colors} />
                 <Row label="Estimated GST" value={formatCurrency(gstTotal)} colors={colors} />
                 <View style={styles.discountRow}>
                   <Text style={[styles.discountLabel, { color: colors.textSecondary }]}>Discount Options</Text>
                   <View style={[styles.discountInputWrapper, { backgroundColor: colors.gray100, borderColor: colors.border }]}>
                      <Text style={{ color: colors.textPlaceholder, marginRight: 2, fontWeight: '800' }}>-₹</Text>
                      <TextInput
                        style={[styles.discountInput, { color: colors.textPrimary }]}
                        placeholder="0"
                        placeholderTextColor={colors.textPlaceholder}
                        keyboardType="numeric"
                        value={discount}
                        onChangeText={setDiscount}
                      />
                   </View>
                 </View>
              </View>

              <LinearGradient
                colors={[colors.primary + "15", colors.accent + "15"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.totalRow, { borderColor: colors.primary + "30" }]}
              >
                <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Grand Total</Text>
                <AnimatedCounter 
                  value={grandTotal} 
                  prefix="₹" 
                  style={[styles.totalValue, { color: colors.primary }]} 
                />
              </LinearGradient>
            </GlassCard>
          </Animated.View>
        )}

        {cart.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200)}>
            <GlassCard style={styles.section} intensity={10} borderRadius={32}>
              <View style={styles.sectionHeader}>
                 <MaterialCommunityIcons name="wallet-bifold-outline" size={20} color={colors.primary} />
                 <Text style={[styles.sectionTitle, { color: colors.primary }]}>Payment Mode</Text>
              </View>
              <View style={styles.payModeRow}>
                {payModes.map((m) => (
                  <TouchableOpacity
                    key={m.mode}
                    style={[
                      styles.payModeBtn,
                      {
                        backgroundColor: paymentMode === m.mode ? colors.primary : colors.gray100,
                        borderColor: paymentMode === m.mode ? colors.primary : colors.border,
                        ...(paymentMode === m.mode ? colors.shadows.soft : {})
                      },
                    ]}
                    onPress={() => {
                      setPaymentMode(m.mode);
                      Haptics.selectionAsync();
                    }}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name={m.icon as any} size={22} color={paymentMode === m.mode ? "#fff" : colors.textSecondary} />
                    <Text style={[styles.payModeText, { color: paymentMode === m.mode ? "#fff" : colors.textSecondary }]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {cart.length > 0 && (
          <Animated.View entering={FadeInDown.delay(250)}>
            <TouchableOpacity
              style={styles.generateBtnContainer}
              onPress={generateBill}
              disabled={loading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={loading ? [colors.muted, colors.border] : [colors.primary, colors.success]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.generateBtnInner}
              >
                <MaterialCommunityIcons name="receipt-text-outline" size={24} color="#fff" />
                <Text style={styles.generateBtnText}>
                  {loading ? "PROCESSING..." : `GENERATE BILL — ${formatCurrency(grandTotal)}`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      <Modal visible={!!qtyModal} transparent animationType="fade">
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
           <TouchableOpacity
             style={styles.modalOverlay}
             activeOpacity={1}
             onPress={() => setQtyModal(null)}
           >
             <View style={[styles.modalSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 24 }]}>
               <View style={[styles.handle, { backgroundColor: colors.border }]} />
               <Text style={[styles.modalTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                 {qtyModal?.product.name}
               </Text>
               <View style={styles.modalMetaRow}>
                  <Text style={[styles.modalSubtitle, { color: colors.primary }]}>
                    {formatCurrency(qtyModal?.product.sellingPrice ?? 0)} / {qtyModal?.product.unit}
                  </Text>
                  <View style={[styles.stockBadge, { backgroundColor: colors.gray100 }]}>
                     <Text style={[styles.stockBadgeText, { color: colors.textSecondary }]}>
                        Stock: {qtyModal?.product.currentStock}
                     </Text>
                  </View>
               </View>
               <View style={styles.qtyPickerRow}>
                 <TouchableOpacity
                   style={[styles.qtyPickerBtn, { backgroundColor: colors.gray100 }]}
                   onPress={() => {
                     setQtyInput((v) => String(Math.max(1, parseInt(v || '1') - 1)));
                     Haptics.selectionAsync();
                   }}
                 >
                   <Feather name="minus" size={24} color={colors.textPrimary} />
                 </TouchableOpacity>
                 <TextInput
                   style={[styles.qtyPickerInput, { borderColor: colors.border, color: colors.primary, backgroundColor: colors.gray100 }]}
                   value={qtyInput}
                   onChangeText={setQtyInput}
                   keyboardType="numeric"
                   textAlign="center"
                 />
                 <TouchableOpacity
                   style={[styles.qtyPickerBtn, { backgroundColor: colors.primary + '20' }]}
                   onPress={() => {
                     setQtyInput((v) => String(parseInt(v || '1') + 1));
                     Haptics.selectionAsync();
                   }}
                 >
                   <Feather name="plus" size={24} color={colors.primary} />
                 </TouchableOpacity>
               </View>
               <TouchableOpacity
                 style={styles.addToCartWrap}
                 onPress={() => {
                   if (qtyModal) {
                     addToCart(qtyModal.product, parseInt(qtyInput) || 1);
                     setQtyModal(null);
                   }
                 }}
                 activeOpacity={0.8}
               >
                 <LinearGradient 
                    colors={[colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.addToCartBtn}
                 >
                   <MaterialCommunityIcons name="cart-plus" size={20} color="#fff" />
                   <Text style={styles.addToCartText}>Confirm Addition</Text>
                 </LinearGradient>
               </TouchableOpacity>
             </View>
           </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function Row({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: 12, padding: 16 },
  section: {
    padding: 24,
    gap: 16,
    overflow: 'hidden',
    marginBottom: 6,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  customerRow: { flexDirection: "row", gap: 12 },
  inputBox: {
    borderWidth: 1.5,
    borderRadius: 20,
    overflow: 'hidden',
  },
  input: {
    padding: 16,
    fontSize: 16,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 56,
  },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '700', height: '100%' },
  resultsWrapper: {
    marginTop: 8,
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 16,
    padding: 8,
  },
  searchResult: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  resultLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  resultIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  resultName: { fontSize: 16, fontWeight: "800" },
  resultStock: { fontSize: 12, fontWeight: '800', marginTop: 2, letterSpacing: 0.5 },
  resultPrice: { fontSize: 17, fontWeight: "900" },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
    borderBottomWidth: 1.5,
    borderStyle: 'dashed',
  },
  cartName: { fontSize: 15, fontWeight: "800" },
  cartRate: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  qtyControl: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8,
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { fontSize: 17, fontWeight: "900", minWidth: 26, textAlign: "center" },
  cartTotal: { fontSize: 17, fontWeight: "900", minWidth: 64, textAlign: "right" },
  summaryBox: {
    marginTop: 10,
    gap: 8,
    paddingTop: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  summaryLabel: { fontSize: 15, fontWeight: '700' },
  summaryValue: { fontSize: 16, fontWeight: "900" },
  discountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  discountLabel: { fontSize: 15, fontWeight: '800' },
  discountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 110,
  },
  discountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    marginTop: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  totalLabel: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  totalValue: { fontSize: 34, fontWeight: "900", letterSpacing: -1 },
  payModeRow: { flexDirection: "row", gap: 10, flexWrap: 'wrap' },
  payModeBtn: {
    width: '48%',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  payModeText: { fontSize: 14, fontWeight: "900", letterSpacing: 0.5, textTransform: 'uppercase' },
  generateBtnContainer: { elevation: 8, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, borderRadius: 28, overflow: 'hidden', marginTop: 12 },
  generateBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 22,
  },
  generateBtnText: { color: "#fff", fontSize: 18, fontWeight: "900", letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 32,
    gap: 20,
    elevation: 20,
  },
  handle: { width: 44, height: 5, borderRadius: 3, alignSelf: "center", marginBottom: 8 },
  modalTitle: { fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  modalMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalSubtitle: { fontSize: 18, fontWeight: '800' },
  stockBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  stockBadgeText: { fontSize: 12, fontWeight: '800' },
  qtyPickerRow: { flexDirection: "row", alignItems: "center", gap: 16, marginVertical: 12 },
  qtyPickerBtn: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyPickerInput: {
    flex: 1,
    height: 64,
    fontSize: 28,
    fontWeight: "900",
    borderWidth: 1.5,
    borderRadius: 20,
  },
  addToCartWrap: { borderRadius: 20, overflow: 'hidden' },
  addToCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 20,
  },
  addToCartText: { color: "#fff", fontSize: 18, fontWeight: "900", letterSpacing: 0.5 },
});
