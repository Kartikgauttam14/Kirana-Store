import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
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
import Animated, { FadeInDown } from "react-native-reanimated";
import { BlurView } from "expo-blur";

import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";
import { GST_RATES } from "@/constants/categories";
import { GlassCard } from "@/components/ui/GlassCard";

export default function EditProductScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const language = useAuthStore((s) => s.language);
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

  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const margin =
    form.costPrice && form.sellingPrice
      ? (
          ((parseFloat(form.sellingPrice) || 0) - (parseFloat(form.costPrice) || 0)) /
          (parseFloat(form.costPrice) || 1) *
          100
        ).toFixed(1)
      : "0.0";

  const handleSave = () => {
    if (!form.name || !form.sellingPrice) {
      Alert.alert(
        language === 'hi' ? "आवश्यक" : "Required", 
        language === 'hi' ? "नाम और विक्रय मूल्य आवश्यक हैं" : "Name and selling price are required"
      );
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
      Alert.alert(
        language === 'hi' ? "गलती" : "Error", 
        language === 'hi' ? "एक मान्य मात्रा दर्ज करें" : "Enter a valid quantity"
      );
      return;
    }
    const current = parseFloat(form.currentStock) || 0;
    const newStock = adjustType === "IN" ? current + qty : Math.max(0, current - qty);
    updateProduct(id!, { currentStock: newStock, updatedAt: new Date().toISOString() });
    setForm((f) => ({ ...f, currentStock: String(newStock) }));
    setAdjustModal(false);
    setAdjustQty("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <BlurView
        intensity={60}
        tint="light"
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 20 : 0) }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {language === 'hi' ? "उत्पाद संपादित करें" : "Edit Product"}
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveText, { color: colors.primary }]}>
            {language === 'hi' ? "सहेजें" : "Save"}
          </Text>
        </TouchableOpacity>
      </BlurView>

      <ScrollView
        contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <GlassCard intensity={15} borderRadius={32} style={styles.stepCard}>
             <Text style={[styles.sectionTitle, { color: colors.primary }]}>
               {language === 'hi' ? "मूल जानकारी" : "Basic Information"}
             </Text>
             
             <InputField label={language === 'hi' ? "उत्पाद का नाम *" : "Product Name *"} value={form.name} onChangeText={(v) => update("name", v)} placeholder="e.g. Organic Basmati Rice" colors={colors} icon="package-variant-closed" />
             <InputField label={language === 'hi' ? "स्थानीय भाषा का नाम" : "Local Language Name"} value={form.nameHindi} onChangeText={(v) => update("nameHindi", v)} placeholder="उदा. बासमती चावल" colors={colors} icon="translate" />

             <View style={[styles.marginBanner, { backgroundColor: colors.primary + '08' }]}>
                <MaterialCommunityIcons name="cube-outline" size={18} color={colors.primary} />
                <Text style={[styles.marginLabel, { color: colors.textSecondary }]}>SKU:</Text>
                <Text style={[styles.marginVal, { color: colors.primary }]}>{product.sku}</Text>
             </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <GlassCard intensity={15} borderRadius={32} style={styles.stepCard}>
             <View style={styles.sectionHeader}>
               <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                 {language === 'hi' ? "मूल्य निर्धारण और स्टॉक" : "Pricing & Stock"}
               </Text>
               <TouchableOpacity
                 style={[styles.adjustBtn, { backgroundColor: colors.accent + '20' }]}
                 onPress={() => setAdjustModal(true)}
               >
                 <Feather name="refresh-cw" size={12} color={colors.accent} />
                 <Text style={[styles.adjustBtnText, { color: colors.accent }]}>
                   {language === 'hi' ? "स्टॉक समायोजित करें" : "Adjust Stock"}
                 </Text>
               </TouchableOpacity>
             </View>

             <View style={styles.row}>
                <View style={{flex: 1}}>
                   <InputField label={language === 'hi' ? "लागत मूल्य" : "Cost Price"} value={form.costPrice} onChangeText={(v) => update("costPrice", v)} placeholder="₹0" colors={colors} keyboardType="decimal-pad" icon="arrow-down-circle-outline" />
                </View>
                <View style={{flex: 1}}>
                   <InputField label={language === 'hi' ? "विक्रय मूल्य" : "Selling Price"} value={form.sellingPrice} onChangeText={(v) => update("sellingPrice", v)} placeholder="₹0" colors={colors} keyboardType="decimal-pad" icon="arrow-up-circle-outline" />
                </View>
             </View>

             {margin && (
               <View style={[styles.marginBanner, { backgroundColor: parseFloat(margin) >= 0 ? colors.success + '10' : colors.danger + '10' }]}>
                 <MaterialCommunityIcons name={parseFloat(margin) >= 0 ? "trending-up" : "trending-down"} size={18} color={parseFloat(margin) >= 0 ? colors.success : colors.danger} />
                 <Text style={[styles.marginLabel, { color: colors.textSecondary }]}>
                   {language === 'hi' ? "लाभ मार्जिन:" : "Profit Margin:"}
                 </Text>
                 <Text style={[styles.marginVal, { color: parseFloat(margin) >= 0 ? colors.success : colors.danger }]}>{margin}%</Text>
               </View>
             )}

             <View style={[styles.stockDisplay, { backgroundColor: colors.gray100, borderColor: colors.border }]}>
               <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>
                 {language === 'hi' ? "वर्तमान स्टॉक मूल्य:" : "Current Stock Value:"}
               </Text>
               <Text style={[styles.stockValue, { color: colors.textPrimary }]}>{form.currentStock} {product.unit}</Text>
             </View>

             <View style={styles.row}>
                <View style={{flex: 1}}>
                   <InputField label={language === 'hi' ? "लो अलर्ट" : "Low Alert"} value={form.reorderLevel} onChangeText={(v) => update("reorderLevel", v)} placeholder="10" colors={colors} keyboardType="numeric" />
                </View>
                <View style={{flex: 1}}>
                   <InputField label={language === 'hi' ? "पुनः ऑर्डर मात्रा" : "Reorder Qty"} value={form.reorderQty} onChangeText={(v) => update("reorderQty", v)} placeholder="20" colors={colors} keyboardType="numeric" />
                </View>
             </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)}>
          <GlassCard intensity={15} borderRadius={32} style={styles.stepCard}>
             <Text style={[styles.sectionTitle, { color: colors.primary }]}>
               {language === 'hi' ? "अतिरिक्त विवरण" : "Additional Details"}
             </Text>

             <View style={styles.group}>
               <Text style={[styles.label, { color: colors.textSecondary }]}>
                 {language === 'hi' ? "जीएसटी दर (%)" : "GST Rate (%)"}
               </Text>
               <View style={styles.chipGrid}>
                 {GST_RATES.map((r) => (
                   <TouchableOpacity
                     key={r}
                     style={[
                       styles.chip,
                       {
                         backgroundColor: form.gstRate === String(r) ? colors.primary : colors.gray100,
                         borderColor: form.gstRate === String(r) ? colors.primary : 'transparent',
                       },
                     ]}
                     onPress={() => update("gstRate", String(r))}
                   >
                     <Text style={[styles.chipText, { color: form.gstRate === String(r) ? "#fff" : colors.textPrimary }]}>
                       {r}%
                     </Text>
                   </TouchableOpacity>
                 ))}
               </View>
             </View>

             <InputField label={language === 'hi' ? "सप्लायर का नाम" : "Supplier Name"} value={form.supplierName} onChangeText={(v) => update("supplierName", v)} placeholder="e.g. Wholesale Mart" colors={colors} icon="truck-outline" />
             <InputField label={language === 'hi' ? "सप्लायर फोन" : "Supplier Phone"} value={form.supplierPhone} onChangeText={(v) => update("supplierPhone", v)} placeholder="+91 XXXXXXXXXX" colors={colors} icon="phone-outline" keyboardType="phone-pad" />
          </GlassCard>
        </Animated.View>
      </ScrollView>

      <Modal visible={adjustModal} transparent animationType="slide">
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
           <TouchableOpacity
             style={styles.modalOverlay}
             activeOpacity={1}
             onPress={() => setAdjustModal(false)}
           >
             <View style={[styles.modalSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 24 }]}>
               <View style={[styles.handle, { backgroundColor: colors.border }]} />
               <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                 {language === 'hi' ? "त्वरित स्टॉक सुधार" : "Quick Stock Adjust"}
               </Text>
               <View style={styles.typeRow}>
                 {(["IN", "OUT"] as const).map((t) => (
                   <TouchableOpacity
                     key={t}
                     style={[
                       styles.typeBtn,
                       { backgroundColor: adjustType === t ? (t === "IN" ? colors.success : colors.danger) : colors.gray100 },
                     ]}
                     onPress={() => setAdjustType(t)}
                   >
                     <Feather name={t === "IN" ? "plus" : "minus"} size={18} color={adjustType === t ? "#fff" : colors.textPrimary} />
                     <Text style={[styles.typeBtnText, { color: adjustType === t ? "#fff" : colors.textPrimary }]}>
                       {t === "IN" 
                         ? (language === 'hi' ? "स्टॉक जोड़ें" : "Add Stock") 
                         : (language === 'hi' ? "स्टॉक घटाएं" : "Remove")}
                     </Text>
                   </TouchableOpacity>
                 ))}
               </View>
               <TextInput
                 style={[styles.adjustInput, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.gray100 }]}
                 placeholder={`Quantity (${product.unit})`}
                 placeholderTextColor={colors.textPlaceholder}
                 keyboardType="numeric"
                 value={adjustQty}
                 onChangeText={setAdjustQty}
                 autoFocus
               />
               <TouchableOpacity
                 style={styles.addToCartWrap}
                 onPress={handleAdjust}
                 activeOpacity={0.8}
               >
                 <LinearGradient 
                    colors={[colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.confirmBtn}
                 >
                   <Text style={styles.confirmBtnText}>Confirm Selection</Text>
                 </LinearGradient>
               </TouchableOpacity>
             </View>
           </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
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
  icon,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  keyboardType?: any;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: 'rgba(0,0,0,0.03)' }]}>
        {icon && <MaterialCommunityIcons name={icon} size={20} color={colors.textPlaceholder} style={styles.inputIcon} />}
        <TextInput
          style={[styles.textInput, { color: colors.textPrimary }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textPlaceholder}
          keyboardType={keyboardType ?? "default"}
          selectionColor={colors.primary}
        />
      </View>
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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
    elevation: 4,
    shadowColor: '#B46414',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    zIndex: 10,
  },
  backBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  saveText: { fontSize: 16, fontWeight: "800" },
  form: { padding: 20, gap: 16 },
  stepCard: { padding: 24, gap: 18 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 13, fontWeight: "800", textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
  },
  group: { gap: 12 },
  label: { fontSize: 13, fontWeight: "800", textTransform: 'uppercase', letterSpacing: 0.5 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  chipText: { fontSize: 14, fontWeight: "800" },
  row: { flexDirection: 'row', gap: 12 },
  marginBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    gap: 10,
  },
  marginLabel: { fontSize: 14, fontWeight: '700' },
  marginVal: { fontSize: 16, fontWeight: '900' },
  stockDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  stockLabel: { fontSize: 14, fontWeight: '700' },
  stockValue: { fontSize: 20, fontWeight: '900' },
  adjustBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  adjustBtnText: { fontWeight: "800", fontSize: 13 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 32,
    gap: 20,
    elevation: 20,
  },
  handle: { width: 44, height: 5, borderRadius: 3, alignSelf: "center", marginBottom: 8 },
  modalTitle: { fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  typeRow: { flexDirection: "row", gap: 12 },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 20,
  },
  typeBtnText: { fontWeight: "800", fontSize: 16 },
  adjustInput: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 18,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  addToCartWrap: { borderRadius: 20, overflow: 'hidden' },
  confirmBtn: {
    padding: 20,
    alignItems: "center",
  },
  confirmBtnText: { color: "#fff", fontSize: 18, fontWeight: "900", letterSpacing: 0.5 },
});
