import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
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
import { PRODUCT_CATEGORIES, UNITS, GST_RATES } from "@/constants/categories";
import { Product } from "@/types/inventory.types";

type Step = 1 | 2 | 3 | 4;

export default function AddProductScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeStore, addProduct } = useData();
  const [step, setStep] = useState<Step>(1);

  const [form, setForm] = useState({
    name: "",
    nameHindi: "",
    category: PRODUCT_CATEGORIES[0].id,
    unit: UNITS[0].id,
    barcode: "",
    costPrice: "",
    sellingPrice: "",
    currentStock: "",
    reorderLevel: "",
    reorderQty: "",
    gstRate: "5",
    hsnCode: "",
    supplierName: "",
    supplierPhone: "",
  });

  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const margin =
    form.costPrice && form.sellingPrice
      ? (
          ((parseFloat(form.sellingPrice) - parseFloat(form.costPrice)) /
            parseFloat(form.costPrice)) *
          100
        ).toFixed(1)
      : null;

  const handleSave = () => {
    if (!form.name || !form.costPrice || !form.sellingPrice || !form.currentStock) {
      Alert.alert("Required Fields", "Please fill all required fields");
      return;
    }
    const sku = `${form.category.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const product: Product = {
      id: `prod_${Date.now()}`,
      storeId: activeStore?.id ?? "",
      name: form.name,
      nameHindi: form.nameHindi || undefined,
      category: form.category,
      sku,
      barcode: form.barcode || undefined,
      unit: form.unit,
      costPrice: parseFloat(form.costPrice) || 0,
      sellingPrice: parseFloat(form.sellingPrice) || 0,
      currentStock: parseFloat(form.currentStock) || 0,
      reorderLevel: parseFloat(form.reorderLevel) || 10,
      reorderQty: parseFloat(form.reorderQty) || 20,
      gstRate: parseFloat(form.gstRate) || 5,
      hsnCode: form.hsnCode || undefined,
      supplierName: form.supplierName || undefined,
      supplierPhone: form.supplierPhone || undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addProduct(product);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Success", "Product added successfully!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const stepTitles = ["Basic Info", "Pricing & Stock", "Tax & Compliance", "Supplier"];

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
        },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => (step === 1 ? router.back() : setStep((s) => (s - 1) as Step))}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Add Product</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.progress}>
        {([1, 2, 3, 4] as Step[]).map((s) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              {
                backgroundColor: s <= step ? colors.primary : colors.muted,
                flex: 1,
                height: s === step ? 4 : 3,
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>
        Step {step}/4 — {stepTitles[step - 1]}
      </Text>

      <ScrollView
        contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && (
          <>
            <InputField label="Product Name *" value={form.name} onChangeText={(v) => update("name", v)} placeholder="e.g. Basmati Rice" colors={colors} />
            <InputField label="हिंदी नाम (Optional)" value={form.nameHindi} onChangeText={(v) => update("nameHindi", v)} placeholder="जैसे बासमती चावल" colors={colors} />
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: form.category === cat.id ? colors.primary : colors.muted,
                          borderColor: form.category === cat.id ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => update("category", cat.id)}
                    >
                      <Text style={[styles.chipText, { color: form.category === cat.id ? "#fff" : colors.textSecondary }]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Unit</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {UNITS.map((u) => (
                    <TouchableOpacity
                      key={u.id}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: form.unit === u.id ? colors.primary : colors.muted,
                          borderColor: form.unit === u.id ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => update("unit", u.id)}
                    >
                      <Text style={[styles.chipText, { color: form.unit === u.id ? "#fff" : colors.textSecondary }]}>
                        {u.id}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            <InputField label="Barcode (Optional)" value={form.barcode} onChangeText={(v) => update("barcode", v)} placeholder="Scan or enter barcode" colors={colors} keyboardType="numeric" />
          </>
        )}

        {step === 2 && (
          <>
            <InputField label="Cost Price (₹) *" value={form.costPrice} onChangeText={(v) => update("costPrice", v)} placeholder="0.00" colors={colors} keyboardType="numeric" />
            <InputField label="Selling Price (₹) *" value={form.sellingPrice} onChangeText={(v) => update("sellingPrice", v)} placeholder="0.00" colors={colors} keyboardType="numeric" />
            {margin && (
              <View style={[styles.marginBox, { backgroundColor: parseFloat(margin) >= 0 ? colors.successLight : colors.dangerLight }]}>
                <Text style={[styles.marginText, { color: parseFloat(margin) >= 0 ? colors.success : colors.danger }]}>
                  Margin: {margin}%
                </Text>
              </View>
            )}
            <InputField label="Current Stock *" value={form.currentStock} onChangeText={(v) => update("currentStock", v)} placeholder="0" colors={colors} keyboardType="numeric" />
            <InputField label="Reorder Level" value={form.reorderLevel} onChangeText={(v) => update("reorderLevel", v)} placeholder="10" colors={colors} keyboardType="numeric" />
            <InputField label="Reorder Quantity" value={form.reorderQty} onChangeText={(v) => update("reorderQty", v)} placeholder="20" colors={colors} keyboardType="numeric" />
          </>
        )}

        {step === 3 && (
          <>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>GST Rate</Text>
              <View style={styles.chipRow}>
                {GST_RATES.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: form.gstRate === String(r) ? colors.primary : colors.muted,
                        borderColor: form.gstRate === String(r) ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => update("gstRate", String(r))}
                  >
                    <Text style={[styles.chipText, { color: form.gstRate === String(r) ? "#fff" : colors.textSecondary }]}>
                      {r}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <InputField label="HSN Code (Optional)" value={form.hsnCode} onChangeText={(v) => update("hsnCode", v)} placeholder="e.g. 1006" colors={colors} keyboardType="numeric" />
          </>
        )}

        {step === 4 && (
          <>
            <InputField label="Supplier Name" value={form.supplierName} onChangeText={(v) => update("supplierName", v)} placeholder="e.g. Ramesh Traders" colors={colors} />
            <InputField label="Supplier Phone" value={form.supplierPhone} onChangeText={(v) => update("supplierPhone", v)} placeholder="10-digit mobile number" colors={colors} keyboardType="phone-pad" />
          </>
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16),
          },
        ]}
      >
        {step < 4 ? (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: colors.primary }]}
            onPress={() => setStep((s) => (s + 1) as Step)}
          >
            <Text style={styles.nextBtnText}>Next</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: colors.success }]}
            onPress={handleSave}
          >
            <Feather name="check" size={18} color="#fff" />
            <Text style={styles.nextBtnText}>Save Product</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  colors,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  keyboardType?: any;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textPrimary }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textPlaceholder}
        keyboardType={keyboardType ?? "default"}
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
  progress: { flexDirection: "row", gap: 6, marginHorizontal: 20, marginTop: 12 },
  progressDot: { borderRadius: 2 },
  stepLabel: { marginHorizontal: 20, marginTop: 6, marginBottom: 4, fontSize: 13 },
  form: { padding: 20, gap: 16 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: "600" },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: "600" },
  marginBox: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  marginText: { fontSize: 15, fontWeight: "700" },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 14,
  },
  nextBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
