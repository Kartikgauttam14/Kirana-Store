import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
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

import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { CartItem, Bill, PaymentMode } from "@/types/billing.types";
import { formatCurrency } from "@/utils/formatCurrency";
import { calculateGST, aggregateBillGST } from "@/utils/gstCalculator";

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

  const payModes: Array<{ mode: PaymentMode; icon: keyof typeof Feather.glyphMap; label: string }> = [
    { mode: "CASH", icon: "dollar-sign", label: "Cash" },
    { mode: "UPI", icon: "smartphone", label: "UPI" },
    { mode: "CARD", icon: "credit-card", label: "Card" },
    { mode: "CREDIT", icon: "clock", label: "Credit" },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>New Bill</Text>
        <TouchableOpacity onPress={() => router.push("/(owner)/billing/history" as any)}>
          <Feather name="clock" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Customer (Optional)</Text>
          <View style={styles.customerRow}>
            <TextInput
              style={[styles.smallInput, { borderColor: colors.border, color: colors.textPrimary, flex: 1 }]}
              placeholder="Name"
              placeholderTextColor={colors.textPlaceholder}
              value={customerName}
              onChangeText={setCustomerName}
            />
            <TextInput
              style={[styles.smallInput, { borderColor: colors.border, color: colors.textPrimary, flex: 1 }]}
              placeholder="Phone"
              placeholderTextColor={colors.textPlaceholder}
              keyboardType="phone-pad"
              maxLength={10}
              value={customerPhone}
              onChangeText={setCustomerPhone}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Add Products</Text>
          <View style={[styles.searchRow, { borderColor: colors.border }]}>
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search product name or SKU..."
              placeholderTextColor={colors.textPlaceholder}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          {searchResults.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.searchResult, { borderColor: colors.border }]}
              onPress={() => {
                setQtyModal({ product: p });
                setQtyInput("1");
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.resultName, { color: colors.textPrimary }]}>{p.name}</Text>
                <Text style={[styles.resultStock, { color: p.currentStock > 0 ? colors.success : colors.danger }]}>
                  Stock: {p.currentStock} {p.unit}
                </Text>
              </View>
              <Text style={[styles.resultPrice, { color: colors.primary }]}>
                {formatCurrency(p.sellingPrice)}/{p.unit}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {cart.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Cart ({cart.length} items)</Text>
            {cart.map((item) => (
              <View key={item.productId} style={[styles.cartItem, { borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cartName, { color: colors.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.cartRate, { color: colors.textSecondary }]}>
                    {formatCurrency(item.price)}/{item.unit} × GST {item.gstRate}%
                  </Text>
                </View>
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    style={[styles.qtyBtn, { backgroundColor: colors.muted }]}
                    onPress={() => updateCartQty(item.productId, item.quantity - 1)}
                  >
                    <Feather name="minus" size={14} color={colors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={[styles.qtyText, { color: colors.textPrimary }]}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={[styles.qtyBtn, { backgroundColor: colors.muted }]}
                    onPress={() => updateCartQty(item.productId, item.quantity + 1)}
                  >
                    <Feather name="plus" size={14} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.cartTotal, { color: colors.primary }]}>
                  {formatCurrency(item.price * item.quantity)}
                </Text>
              </View>
            ))}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Row label="Subtotal" value={formatCurrency(subtotal)} colors={colors} />
            <Row label="GST" value={formatCurrency(gstTotal)} colors={colors} />
            <View style={styles.discountRow}>
              <Text style={[styles.discountLabel, { color: colors.textSecondary }]}>Discount (₹)</Text>
              <TextInput
                style={[styles.discountInput, { borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="0"
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="numeric"
                value={discount}
                onChangeText={setDiscount}
              />
            </View>
            <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Grand Total</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                {formatCurrency(grandTotal)}
              </Text>
            </View>
          </View>
        )}

        {cart.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Payment Mode</Text>
            <View style={styles.payModeRow}>
              {payModes.map((m) => (
                <TouchableOpacity
                  key={m.mode}
                  style={[
                    styles.payModeBtn,
                    {
                      backgroundColor: paymentMode === m.mode ? colors.primary : colors.muted,
                      borderColor: paymentMode === m.mode ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setPaymentMode(m.mode)}
                >
                  <Feather name={m.icon} size={18} color={paymentMode === m.mode ? "#fff" : colors.mutedForeground} />
                  <Text style={[styles.payModeText, { color: paymentMode === m.mode ? "#fff" : colors.mutedForeground }]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {cart.length > 0 && (
          <TouchableOpacity
            style={[styles.generateBtn, { backgroundColor: loading ? colors.muted : colors.primary }]}
            onPress={generateBill}
            disabled={loading}
          >
            <Feather name="file-text" size={20} color="#fff" />
            <Text style={styles.generateBtnText}>
              {loading ? "Generating..." : `Generate Bill — ${formatCurrency(grandTotal)}`}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal visible={!!qtyModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setQtyModal(null)}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {qtyModal?.product.name}
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              {formatCurrency(qtyModal?.product.sellingPrice ?? 0)}/{qtyModal?.product.unit}
              {" · "}Stock: {qtyModal?.product.currentStock}
            </Text>
            <View style={styles.qtyPickerRow}>
              <TouchableOpacity
                style={[styles.qtyPickerBtn, { backgroundColor: colors.muted }]}
                onPress={() => setQtyInput((v) => String(Math.max(1, parseInt(v) - 1)))}
              >
                <Feather name="minus" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <TextInput
                style={[styles.qtyPickerInput, { borderColor: colors.border, color: colors.textPrimary }]}
                value={qtyInput}
                onChangeText={setQtyInput}
                keyboardType="numeric"
                textAlign="center"
              />
              <TouchableOpacity
                style={[styles.qtyPickerBtn, { backgroundColor: colors.muted }]}
                onPress={() => setQtyInput((v) => String(parseInt(v) + 1))}
              >
                <Feather name="plus" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.addToCartBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                if (qtyModal) {
                  addToCart(qtyModal.product, parseInt(qtyInput) || 1);
                  setQtyModal(null);
                }
              }}
            >
              <Feather name="shopping-cart" size={18} color="#fff" />
              <Text style={styles.addToCartText}>Add to Bill</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontWeight: "800" },
  content: { gap: 12, padding: 16 },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  sectionTitle: { fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  customerRow: { flexDirection: "row", gap: 10 },
  smallInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 11,
    fontSize: 15,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 11,
  },
  searchInput: { flex: 1, fontSize: 15 },
  searchResult: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  resultName: { fontSize: 14, fontWeight: "600" },
  resultStock: { fontSize: 12, marginTop: 2 },
  resultPrice: { fontSize: 14, fontWeight: "700" },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  cartName: { fontSize: 14, fontWeight: "600" },
  cartRate: { fontSize: 12, marginTop: 2 },
  qtyControl: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { fontSize: 15, fontWeight: "700", minWidth: 24, textAlign: "center" },
  cartTotal: { fontSize: 14, fontWeight: "700", minWidth: 60, textAlign: "right" },
  divider: { height: 1, marginVertical: 4 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: "600" },
  discountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  discountLabel: { fontSize: 14 },
  discountInput: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 80,
    fontSize: 15,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalLabel: { fontSize: 18, fontWeight: "700" },
  totalValue: { fontSize: 24, fontWeight: "800" },
  payModeRow: { flexDirection: "row", gap: 8 },
  payModeBtn: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  payModeText: { fontSize: 12, fontWeight: "600" },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 18,
    borderRadius: 16,
  },
  generateBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center" },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  modalSubtitle: { fontSize: 14 },
  qtyPickerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  qtyPickerBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyPickerInput: {
    flex: 1,
    height: 48,
    fontSize: 22,
    fontWeight: "700",
    borderWidth: 1.5,
    borderRadius: 12,
  },
  addToCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 14,
  },
  addToCartText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
