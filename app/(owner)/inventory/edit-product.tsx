import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { UNITS, GST_RATES } from "@/constants/categories";

export default function EditProductScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, updateProduct } = useData();
  const product = products.find((p) => p.id === id);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    nameHindi: product?.nameHindi ?? "",
    sellingPrice: String(product?.sellingPrice ?? ""),
    costPrice: String(product?.costPrice ?? ""),
    currentStock: String(product?.currentStock ?? ""),
    reorderLevel: String(product?.reorderLevel ?? ""),
    reorderQty: String(product?.reorderQty ?? ""),
    gstRate: String(product?.gstRate ?? "5"),
    supplierName: product?.supplierName ?? "",
    supplierPhone: product?.supplierPhone ?? "",
  });

  const [adjustModal, setAdjustModal] = useState(false);
  const [adjustType, setAdjustType] = useState<"IN" | "OUT">("IN");
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("PURCHASE");

  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    if (!form.name || !form.sellingPrice) {
      Alert.alert("Required", "Name and selling price are required");
      return;
    }
    updateProduct(id!, {
      name: form.name,
      nameHindi: form.nameHindi || undefined,
      sellingPrice: parseFloat(form.sellingPrice) || 0,
      costPrice: parseFloat(form.costPrice) || 0,
      currentStock: parseFloat(form.currentStock) || 0,
      reorderLevel: parseFloat(form.reorderLevel) || 10,
      reorderQty: parseFloat(form.reorderQty) || 20,
      gstRate: parseFloat(form.gstRate) || 5,
      supplierName: form.supplierName || undefined,
      supplierPhone: form.supplierPhone || undefined,
      updatedAt: new Date().toISOString(),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleAdjust = () => {
    const qty = parseFloat(adjustQty);
    if (!qty || qty <= 0) {
      Alert.alert("Error", "Enter a valid quantity");
      return;
    }
    const current = parseFloat(form.currentStock) || 0;
    const newStock = adjustType === "IN" ? current + qty : Math.max(0, current - qty);
    updateProduct(id!, { currentStock: newStock, updatedAt: new Date().toISOString() });
    setForm((f) => ({ ...f, currentStock: String(newStock) }));
    setAdjustModal(false);
    setAdjustQty("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Updated", `Stock updated to ${newStock} ${product?.unit}`);
  };

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.textPrimary }}>Product not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Edit Product</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveText, { color: colors.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <FieldRow label="Product Name" value={form.name} onChange={(v) => update("name", v)} colors={colors} />
        <FieldRow label="हिंदी नाम" value={form.nameHindi} onChange={(v) => update("nameHindi", v)} colors={colors} />
        <FieldRow label="Selling Price (₹)" value={form.sellingPrice} onChange={(v) => update("sellingPrice", v)} colors={colors} keyboardType="numeric" />
        <FieldRow label="Cost Price (₹)" value={form.costPrice} onChange={(v) => update("costPrice", v)} colors={colors} keyboardType="numeric" />

        <View style={[styles.stockSection, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>Current Stock</Text>
            <Text style={[styles.stockValue, { color: colors.primary }]}>
              {form.currentStock} {product.unit}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.adjustBtn, { backgroundColor: colors.primary }]}
            onPress={() => setAdjustModal(true)}
          >
            <Feather name="edit-3" size={14} color="#fff" />
            <Text style={styles.adjustBtnText}>Adjust Stock</Text>
          </TouchableOpacity>
        </View>

        <FieldRow label="Reorder Level" value={form.reorderLevel} onChange={(v) => update("reorderLevel", v)} colors={colors} keyboardType="numeric" />
        <FieldRow label="Reorder Quantity" value={form.reorderQty} onChange={(v) => update("reorderQty", v)} colors={colors} keyboardType="numeric" />
        <FieldRow label="Supplier Name" value={form.supplierName} onChange={(v) => update("supplierName", v)} colors={colors} />
        <FieldRow label="Supplier Phone" value={form.supplierPhone} onChange={(v) => update("supplierPhone", v)} colors={colors} keyboardType="phone-pad" />

        <View style={styles.gstRow}>
          {GST_RATES.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.gstChip, { backgroundColor: form.gstRate === String(r) ? colors.primary : colors.muted }]}
              onPress={() => update("gstRate", String(r))}
            >
              <Text style={[styles.gstText, { color: form.gstRate === String(r) ? "#fff" : colors.textSecondary }]}>
                GST {r}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal visible={adjustModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAdjustModal(false)}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Adjust Stock</Text>
            <View style={styles.typeRow}>
              {(["IN", "OUT"] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeBtn,
                    { backgroundColor: adjustType === t ? (t === "IN" ? colors.success : colors.danger) : colors.muted },
                  ]}
                  onPress={() => setAdjustType(t)}
                >
                  <Feather name={t === "IN" ? "plus" : "minus"} size={16} color={adjustType === t ? "#fff" : colors.mutedForeground} />
                  <Text style={[styles.typeBtnText, { color: adjustType === t ? "#fff" : colors.mutedForeground }]}>
                    {t === "IN" ? "Add Stock" : "Remove Stock"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.adjustInput, { backgroundColor: colors.muted, color: colors.textPrimary }]}
              placeholder={`Quantity (${product.unit})`}
              placeholderTextColor={colors.textPlaceholder}
              keyboardType="numeric"
              value={adjustQty}
              onChangeText={setAdjustQty}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
              onPress={handleAdjust}
            >
              <Text style={styles.confirmBtnText}>Confirm Adjustment</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function FieldRow({ label, value, onChange, colors, keyboardType }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  colors: any;
  keyboardType?: any;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textPrimary }]}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType ?? "default"}
        returnKeyType="done"
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
  headerTitle: { fontSize: 18, fontWeight: "700" },
  saveText: { fontSize: 16, fontWeight: "700" },
  form: { padding: 20, gap: 14 },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: "600" },
  fieldInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 13,
    fontSize: 16,
  },
  stockSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  stockLabel: { fontSize: 13 },
  stockValue: { fontSize: 22, fontWeight: "800", marginTop: 2 },
  adjustBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  adjustBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  gstRow: { flexDirection: "row", gap: 8 },
  gstChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  gstText: { fontSize: 13, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  typeRow: { flexDirection: "row", gap: 12 },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 14,
    borderRadius: 14,
  },
  typeBtnText: { fontWeight: "600", fontSize: 15 },
  adjustInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  confirmBtn: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  confirmBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
